import path from "path";
import fs from "fs";
import os from "os";
import axios from "axios";
import { app } from "electron";
import { isConvertableWeightFormat, isMLCFormat, mlcChatConfigExistsAndIsValid, convertModelWeights, genChatConfig } from "./utils/installUtils";
import { v4 as uuidv4 } from "uuid";
import diskusage from "diskusage";

interface Model {
    name: string;
    size: number;
    path: string;
}

interface Download {
    url: string;
    model: Model;
    progress: number;
}

export class ModelManager {
    mainWindow: any;
    downloads: { [key: string]: Download };
    installQueue: Model[];
    installInProgress: boolean;

    constructor(mainWindow: any) {
        this.mainWindow = mainWindow;
        this.downloads = {};
        this.installQueue = [];
        this.installInProgress = false;
    }

    canInstall(modelSize: number): boolean {
        // Check if there's enough memory to install the model
        const systemMemory = os.totalmem();
        return systemMemory > modelSize;
    }

    async getRepoInfo(hfRepoId: string): Promise<any> {
        // Get the set of files in the model repo
        const res = await axios.get(`https://huggingface.co/api/models/${hfRepoId}?`);
        if (res.status !== 200) throw new Error("Failed to fetch model data");
    
        const files = res.data.siblings;
        console.log(`Found ${files.length} files in the model repo`);
    
        // Create an array of promises for HEAD requests
        const sizePromises = files.map(async (file: any) => {
        const fileUrl = `https://huggingface.co/${hfRepoId}/resolve/main/${file.rfilename}`;
        const response = await axios.head(fileUrl);
        if (response.status !== 200) throw new Error("Failed to fetch file size");
        return parseInt(response.headers['content-length']);
        });
    
        // Wait for all HEAD requests to complete
        const sizes = await Promise.all(sizePromises);
    
        // Calculate the total size
        const totalSize = sizes.reduce((acc, size) => acc + size, 0);
    
        return {
            files,
            totalSize
        };
    }

    async downloadModel(hfRepoId: string) {
        console.log(`Downloading model ${hfRepoId}`);

        const uuid = uuidv4();
        const baseUrl = `https://huggingface.co/${hfRepoId}`;
        const { files, totalSize } = await this.getRepoInfo(hfRepoId);

        const { free } = await diskusage.check(os.platform() === "win32" ? "C:" : "/");
        if (free < totalSize) {
            throw new Error(`Not enough free disk space to download ${hfRepoId}`);
        }

        const parentDir = path.join(app.getPath("userData"), "models");
        const baseDir = path.resolve(parentDir, `${hfRepoId}`);
        await fs.promises.mkdir(baseDir, { recursive: true });
        console.log(`Created directory ${baseDir}`);

        this.downloads[uuid] = {
            url: baseUrl,
            model: {
                name: hfRepoId,
                size: totalSize,
                path: baseDir
            },
            progress: 0
        };

        for (const file of files) {
            const fileUrl = `${baseUrl}/resolve/main/${file.rfilename}?download=true`;
            const filePath = path.resolve(baseDir, file.rfilename);
            console.log(`Starting download for file ${file.rfilename}`);

            const response = await axios({
                url: fileUrl,
                method: "GET",
                responseType: "stream"
            });

            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            const writer = fs.createWriteStream(filePath);

            let bytesDownloaded = 0;
            response.data.on("data", (chunk: any) => {
                bytesDownloaded += chunk.length;
                
                if ((100 * bytesDownloaded / totalSize) - this.downloads[uuid].progress >= 0.25) {
                    this.downloads[uuid].progress = 0.25 * Math.floor(100 * bytesDownloaded / totalSize / 0.25);
                    this.mainWindow.webContents.send("download-progress", {
                        "model": hfRepoId,
                        "progress": this.downloads[uuid].progress
                    });
                }
            });

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            writer.end();
            console.log(`Downloaded file ${file.rfilename}`);
        }

        this.installQueue.push(this.downloads[uuid].model);
        await this.installModel()
        delete this.downloads[uuid];
    }

    async installModel() {
        // Check if there are any models in the install queue
        if (this.installQueue.length === 0 || this.installInProgress) return;

        // Get the first model in the queue
        const model = this.installQueue[0];

        // Check if there's enough free memory to install the model
        if (!this.canInstall(model.size)) {
            console.log("Not enough free memory to install model");
            return;
        }

        // Install the model
        console.log(`Installing model ${model.name}`);
        this.installInProgress = true;
        this.installQueue.shift();

        const isMLC = await isMLCFormat(model.path);
        if (isMLC) {
            console.log("Model is already in MLC format");
            this.installInProgress = false;
            return;
        }

        const convertableWeightFormat = isConvertableWeightFormat(model.path);
        const hasChatConfig = mlcChatConfigExistsAndIsValid(model.path);
        const hasNdArrayCache = mlcChatConfigExistsAndIsValid(model.path);

        if (!convertableWeightFormat && !hasChatConfig && hasNdArrayCache) {
            console.log("Model is in MLC format but lacks chat config");
            await genChatConfig(model.path, os.totalmem(), model.size);
            this.installInProgress = false;
            return;
        }

        if (convertableWeightFormat) {
            console.log("Model is in convertable weight format");
            const systemRam = os.totalmem();
            await convertModelWeights(model.path, systemRam, model.size);
            this.installInProgress = false;
            return;
        }

        console.error(`Failed to install model ${model.name}`);
        this.installInProgress = false;
    }
}