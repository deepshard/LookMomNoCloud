import fs from "fs";
import os from "os";
import disk from "diskusage";
import axios from "axios";
import path from "path";
import glob from "glob";
import { spawn } from "child_process";
import { startServer } from "./ipc";
import { app } from "electron";

async function getFreeDiskSpace(): Promise<number> {
    const path = os.platform() === "win32" ? "C:" : "/";
    const { free } = await disk.check(path);
    return free;
}

function checkForModelDownload(modelName: string) {
    console.log(`Checking for model download for ${modelName}`);
    const parentDir = path.join(__dirname, '../..');
    const pattern = path.resolve(parentDir, `.tmp/${modelName}-*-MLC`);

    const matchingPaths = glob.sync(pattern);

    if (matchingPaths.length > 0) {
        return matchingPaths[0]; // Return the first matching path
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

async function getModelSize(hfRepoId: string) {
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

async function downloadModel(hfRepoId: string, files: any, totalRepoSize: number, mainWindow: any): Promise<string> {
    console.log(`Downloading model ${hfRepoId}`);

    const parentDir = path.join(app.getPath("userData"), "models");
    const baseDir = path.resolve(parentDir, `${hfRepoId}`);
    await fs.promises.mkdir(baseDir, { recursive: true });
    console.log(`Created directory ${baseDir}`);

    let filesDownloaded = 0;
    const totalFiles = files.length;
    for (const file of files) {
        const fileUrl = `https://huggingface.co/${hfRepoId}/resolve/main/${file.rfilename}?download=true`;
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
        let lastProgress = 0;
        response.data.on('data', (chunk: any) => {
            bytesDownloaded += chunk.length;

            // Truncate download progress to 0.25% increments
            if ((100 * bytesDownloaded / totalRepoSize) - lastProgress >= 0.25) {
                // Set last progress to be the nearest 0.25% increment
                lastProgress = 0.25 * Math.floor(100 * bytesDownloaded / totalRepoSize / 0.25);
                mainWindow.webContents.send('download-progress', {
                    "currentFileNum": filesDownloaded + 1,
                    "totalFiles": totalFiles,
                    "currentProgress": lastProgress
                });
            }
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        writer.end();

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
    console.log(`Model path: ${modelPath}`);
    console.log(`System RAM: ${systemRAM}`);
    console.log(`Model size: ${modelSize}`);
    let res = spawn("bin/server", [
        "--cmd",
        "convert_weight",
        "--model_path",
        modelPath,
        "--conv_template",
        "redpajama_chat",
        "--system_ram",
        systemRAM.toString(),
        "--model_size",
        modelSize.toString(),
    ]);

    const logStream = fs.createWriteStream("convert_weights.log", { flags: "a" });
    res.stdout.pipe(logStream);
    res.stderr.pipe(logStream);

    // Get the stdout of the process
    let stdout = "";

    res.stdout.on("data", (chunk) => {
        const output = chunk.toString();
        stdout += output;
    });

    // Wait for the process to finish
    await new Promise((resolve, reject) => {
        res.on("close", (code) => {
            if (code === 0) {
                resolve(null);
            } else {
                reject(new Error(`Failed to convert model weights. Exit code: ${code}`));
            }
        });
    });

    console.log(stdout);
    return stdout;
}

export async function loadModel(hfRepoId: string, mainWindow: any) {
    let modelPath = checkForModelDownload(hfRepoId);
    if (modelPath) {
        console.log(`Model ${hfRepoId} already downloaded`);
        console.log(`Model path: ${modelPath}`);
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
    const { files, totalSize } = await getModelSize(hfRepoId);
    console.log(`Model size: ${totalSize}, available space: ${diskSpaceAvailable}`);
    if (totalSize > diskSpaceAvailable) {
        throw new Error(`Not enough disk space to download model. Model size: ${totalSize}, available space: ${diskSpaceAvailable}`);
    }

    modelPath = await downloadModel(hfRepoId, files, totalSize, mainWindow);

    const isMLC = await isMLCFormat(modelPath);
    if (isMLC) {
        console.log(`Model ${hfRepoId} is in MLC format`);
        const processInfo = await startServer(modelPath);
        return processInfo;
    }

    const systemRAM = os.totalmem();
    await convertModelWeights(modelPath, systemRAM, totalSize);
    const convertedWeightsPath = await checkForModelDownload(hfRepoId);
    console.log(`Converted weights path: ${convertedWeightsPath}`);
    const processInfo = await startServer(convertedWeightsPath); // this does JIT compilation
    return processInfo;
}
