import { BrowserWindow, app, autoUpdater, ipcMain } from "electron";
import { AppUpdater } from "electron-updater";
import path from "path";
import os from "os";
import si from "systeminformation";
import axios from "axios";
import fs from "fs";
import zlib from "zlib";
import stream from "stream";
import { promisify } from "util";
import tar from "tar";

interface DownloadProgress {
  downloadedBytes: number;
  totalBytes: number;
  progress: number;
}

export class OTAUpdater {
  private mainWindow: BrowserWindow;
  private appUpdater: AppUpdater;
  private downloadProgress: DownloadProgress;
  private updateServer = false;
  private updateApp = false;

  constructor(mainWindow: BrowserWindow, appUpdater: AppUpdater) {
    this.mainWindow = mainWindow;
    this.appUpdater = appUpdater;
    this.downloadProgress = {
      downloadedBytes: 0,
      totalBytes: 0,
      progress: 0,
    };
  }

  unzipTarGz = async (inputPath: string, outputPath: string) => {
    try {
      const tmpPath = path.join(app.getPath("userData"), "bin", "tmp");

      // Create output path if it doesn't exist
      if (!fs.existsSync(tmpPath)) {
        fs.mkdirSync(tmpPath, { recursive: true });
      }

      // Unzip tar.gz to temp folder
      await tar.x({
        file: inputPath,
        C: tmpPath,
        sync: true,
      });

      // Find the server folder in the temp folder
      const extractedContents = fs.readdirSync(tmpPath);
      const serverDir = extractedContents.find(dir => fs.statSync(path.join(tmpPath, dir)).isDirectory() && dir === 'server');
      if (!serverDir) {
        throw new Error("Server directory not found in tar.gz");
      }

      // Move server folder to output path
      fs.renameSync(path.join(tmpPath, serverDir), outputPath);
      fs.rmSync(tmpPath, { recursive: true, force: true });

  
      // Delete tar.gz
      fs.unlinkSync(inputPath);
      return outputPath;
    } catch (error) {
      console.error(error);
    }
  }

  addBytesToDownload = (bytes: number): void => {
    if (bytes < 0) {
      throw new Error("Bytes cannot be negative");
    }
    this.downloadProgress.totalBytes += bytes
  }

  updateProgress(bytesReceived: number): void {
    if (bytesReceived < 0) {
      throw new Error("Bytes received cannot be negative");
    }
    this.downloadProgress.downloadedBytes += bytesReceived;
    if (this.downloadProgress.downloadedBytes > this.downloadProgress.totalBytes) {
      this.downloadProgress.downloadedBytes = this.downloadProgress.totalBytes;
    }

    // Send progress to renderer process
    let last_progress = 0;
    const progress = this.downloadProgress.downloadedBytes / this.downloadProgress.totalBytes;
    if (progress - last_progress > 0.1) {
      console.log(progress);
      last_progress = progress;
    }
    this.mainWindow.webContents.send(
      "update-download-progress",
      {
        progress: progress,
        bytes: this.downloadProgress.downloadedBytes,
        totalBytes: this.downloadProgress.totalBytes,
      }
    )
  }

  getServerUpdateSize = async (url: string): Promise<number> => {
    console.log(url);
    try {
      const response = await axios.head(url);
      return parseInt(response.headers["content-length"]);
    } catch (error) {
      console.error(error);
    }
  }

  checkForServerUpdate = async () => {
    // Read hash from latest.txt
    const filePath = path.join(app.getPath("userData"), "bin", "server", "version.txt");
    let latestHash = "";
    try {
      latestHash = fs.readFileSync(filePath, "utf8");
    } catch (error) {
      console.error(error);
    }
  
    // Get latest hash latest.txt on S3
    const url = "https://truffle-binaries.s3.amazonaws.com/latest.txt";
    let response: any = null;
    try {
      response = await axios.get(url);
    } catch (error) {
      console.error(error);
    }
  
    // Compare hashes
    console.log("Latest hash locally: ", latestHash);
    console.log("Response hash: ", response.data);
    if (response && latestHash !== response.data) {
      return response.data;
    }
  
    return null;
  }

  downloadServer = async (url: string, output: string) => {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    const filePath = path.join(app.getPath("userData"), "bin", output);
    const writeStream = fs.createWriteStream(filePath);
    response.data.on("data", (chunk: Buffer) => {
      this.updateProgress(chunk.length);
    });
    response.data.pipe(writeStream);

    // Wait for download to finish
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // Unzip tar.gz
    await this.unzipTarGz(filePath, path.join(app.getPath("userData"), "bin", "server_new").toString());
  }

  downloadUpdate = async () => {
    // Check if updates are available
    const serverUpdateInfo = await this.checkForServerUpdate();
    // const appUpdateInfo = await this.appUpdater.checkForUpdates();

    this.updateServer = serverUpdateInfo != null;
    this.updateApp = false; // appUpdateInfo ? app.getVersion() !== appUpdateInfo.updateInfo.version : false;
    console.log("Server update: ", this.updateServer);

    // Get update sizes
    let url = "";
    if (this.updateServer) {
      console.log("Getting server size")
      // Get platform information
      const osInfo = await si.osInfo();
      const graphicsInfo = await si.graphics();
      const gpu = osInfo.platform === "darwin" ? "metal" : graphicsInfo.controllers[0].model;
      url = `https://truffle-binaries.s3.amazonaws.com/${serverUpdateInfo}/${osInfo.platform}-${gpu}-${osInfo.arch}.tar.gz`;

      // Add server update size to total bytes to download
      this.addBytesToDownload(await this.getServerUpdateSize(url));
      console.log("Server update size: ", this.downloadProgress.totalBytes)
;    }

    if (this.updateApp) {
      const files = appUpdateInfo.updateInfo.files;

      let sizeOfDownload = 0;
      for (let i = 0; i < files.length; i++) {
        if (files[i].size) {
          sizeOfDownload += files[i].size;
        }
      }

      this.addBytesToDownload(sizeOfDownload);
    }

    this.mainWindow.webContents.send("update-available", this.downloadProgress);

    if (this.updateServer && url !== "") {
      await this.downloadServer(url, "server_new.tar.gz");
    }
    
    if (this.updateApp) {
      await this.appUpdater.downloadUpdate();
    }
  }

  restartAndInstall = () => {
    if (this.updateServer) {
      const binPath = path.join(app.getPath("userData"), "bin");
      const serverPath = path.join(binPath, "server");
      const newServerPath = path.join(binPath, "server_new");

      fs.rmdirSync(serverPath, { recursive: true });
      console.log("Deleted server folder");

      fs.renameSync(newServerPath, serverPath);
      console.log("Renamed new server folder");
    }

    if (this.updateApp) {
      autoUpdater.quitAndInstall();
    }

    if (this.updateServer) {
      app.relaunch();
      app.quit();
    }
  }
}
