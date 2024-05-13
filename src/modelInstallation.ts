import fs from "fs";
import os from "os";
import disk from "diskusage";
import axios from "axios";
import path from "path";
import { spawn } from "child_process";
import { startServer } from "./ipc";

async function getFreeDiskSpace(): Promise<number> {
    const path = os.platform() === "win32" ? "C:" : "/";
    const { free } = await disk.check(path);
    return free;
}

function checkForModelDownload(modelName: string): string {
    console.log(`Checking for model download for ${modelName}`);
    const parentDir = path.join(__dirname, '../..');
    const baseDir = path.resolve(parentDir, `.tmp/${modelName}`);
    if (fs.existsSync(baseDir)) {
        return baseDir;
    } else {
        return null;
    }
}

async function checkForModelPrecompile(modelName: string): Promise<string> {
    // TODO: implement
    return null;
}

async function downloadPrecompile(downloadUrl: string, modelName: string): Promise<string> {
    // TODO: implement
    return "";
}

async function getModelSize(hfRepoId: string): Promise<number> {
    // TODO: implement
    // for now just return 16gb in bytes
    return 16 * 1024 * 1024 * 1024;
}

async function downloadModel(modelUrl: string, mainWindow: any): Promise<string> {
    // Assert that the model URL abides by the huggingface model URL format
    const MODEL_PREFIX = "https://huggingface.co/";
    if (!modelUrl.startsWith(MODEL_PREFIX)) throw new Error("Invalid model URL");
    console.log(modelUrl.split("/").length);
    if (modelUrl.split("/").length != 5) throw new Error("Invalid model URL");

    // Parse the user and model name from the URL
    const [user, modelName] = modelUrl.slice(MODEL_PREFIX.length).split("/");
    console.log(`Downloading model ${modelName} from user ${user}`);

    const parentDir = path.join(__dirname, '../..');
    const baseDir = path.resolve(parentDir, `.tmp/${user}/${modelName}`);
    await fs.promises.mkdir(baseDir, { recursive: true });
    console.log(`Created directory ${baseDir}`);
  
    // Get the set of files in the model repo
    const res = await axios.get(`https://huggingface.co/api/models/${user}/${modelName}?`);
    if (res.status != 200) throw new Error("Failed to fetch model data");
    const files = res.data.siblings;
    console.log(`Found ${files.length} files in the model repo`);

    let filesDownloaded = 0;
    const totalFiles = files.length;
    for (const file of files) {
        const fileUrl = `https://huggingface.co/${user}/${modelName}/resolve/main/${file.rfilename}?download=true`;
        const filePath = path.resolve(baseDir, file.rfilename);
        console.log(`Starting download for file ${filesDownloaded + 1}/${totalFiles}: ${file.rfilename}`);
      
        const response = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'stream'
        });

        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        const writer = fs.createWriteStream(filePath);

        let bytesDownloaded = 0;
        const totalFileSize = response.headers['content-length'];
        response.data.on('data', (chunk: any) => {
            bytesDownloaded += chunk.length;
            mainWindow.webContents.send('download-progress', {
                "currentFileNum": filesDownloaded + 1,
                "totalFiles": totalFiles,
                "currentProgress": 100 * bytesDownloaded / totalFileSize
            });
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log(`Finished downloading file ${filesDownloaded + 1}/${totalFiles}`);
        filesDownloaded++;
    }

    return baseDir;
}

async function isMLCFormat(modelPath: string): Promise<boolean> {
    // TODO: implement
    return false;
}

async function convertModelWeights(modelPath: string, systemRAM: number, modelSize: number): Promise<string> {
    // The python script will automatically determine the proper quantization level
    console.log("Converting model weights");
    let res = spawn("bin/server", [
        "--cmd",
        "convert_weights",
        "--model_path",
        modelPath,
        "--system_ram",
        systemRAM.toString(),
        "--model_size",
        modelSize.toString(),
    ], {
        detached: true,
        stdio: ["pipe"],
    });

    res.unref();

    const logStream = fs.createWriteStream("convert_weights.log", { flags: "a" });
    res.stdout.pipe(logStream);
    res.stderr.pipe(logStream);

    // Get the stdout of the process
    let stdout = "";
    for await (const chunk of res.stdout) {
        stdout += chunk;
    }

    return stdout;
}

export async function loadModel(hfRepoId: string, mainWindow: any) {
    let modelPath = checkForModelDownload(hfRepoId);
    if (modelPath) {
        console.log(`Model ${hfRepoId} already downloaded`);
        const processInfo = await startServer(modelPath);
        return processInfo;
    }

    const modelPrecompile = await checkForModelPrecompile(hfRepoId);
    if (modelPrecompile) {
        console.log(`Found precompile for ${hfRepoId}`);
        const precompilePath = await downloadPrecompile(modelPrecompile, hfRepoId);
        const processInfo = await startServer(precompilePath);
        return processInfo;
    }

    const diskSpaceAvailable = await getFreeDiskSpace();
    const modelSize = await getModelSize(hfRepoId);
    if (modelSize > diskSpaceAvailable) {
        throw new Error(`Not enough disk space to download model. Model size: ${modelSize}, available space: ${diskSpaceAvailable}`);
    }

    const modelUrl = `https://huggingface.co/${hfRepoId}`;
    modelPath = await downloadModel(modelUrl, mainWindow);

    const isMLC = await isMLCFormat(modelPath);
    if (isMLC) {
        console.log(`Model ${hfRepoId} is in MLC format`);
        const processInfo = await startServer(modelPath);
        return processInfo;
    }

    const systemRAM = os.totalmem();
    const convertedWeightsPath = await convertModelWeights(modelPath, systemRAM, modelSize);
    const processInfo = await startServer(convertedWeightsPath); // this does JIT compilation
    return processInfo;
}
