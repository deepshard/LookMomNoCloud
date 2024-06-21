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

interface DownloadProgress {
  downloadedBytes: number;
  totalBytes: number;
  progress: number;
}

export class OTAUpdater {
  private mainWindow: BrowserWindow;
  private appUpdater: AppUpdater;
  private downloadProgress: DownloadProgress;
  private updateServer: boolean = false;
  private updateApp: boolean = false;

  constructor(mainWindow: BrowserWindow, appUpdater: AppUpdater) {
    this.mainWindow = mainWindow;
    this.appUpdater = appUpdater;
    this.downloadProgress = {
      downloadedBytes: 0,
      totalBytes: 0,
      progress: 0,
    };
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
    const progress = this.downloadProgress.downloadedBytes / this.downloadProgress.totalBytes;
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
    const response = await axios.head(url);
    return parseInt(response.headers["content-length"]);
  }

  checkForServerUpdate = async () => {
    // Read hash from latest.txt
    const filePath = path.join(app.getPath("userData"), "bin", "server", "latest.txt");
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
    if (response && latestHash !== response.data) {
      return latestHash;
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
    const pipeline = promisify(stream.pipeline);
    await pipeline(fs.createReadStream(filePath), zlib.createGunzip(), fs.createWriteStream(filePath.replace(".tar.gz", "")));

    // Delete tar.gz
    fs.unlinkSync(filePath);
  }

  downloadUpdate = async () => {
    // Check if updates are available
    const serverUpdateInfo = await this.checkForServerUpdate();
    const appUpdateInfo = await this.appUpdater.checkForUpdates();

    this.updateServer = serverUpdateInfo != null;
    this.updateApp = appUpdateInfo ? app.getVersion() !== appUpdateInfo.updateInfo.version : false;

    // Get update sizes
    let url = "";
    if (this.updateServer) {
      // Get platform information
      const osInfo = await si.osInfo();
      const graphicsInfo = await si.graphics();
      const gpu = osInfo.platform === "darwin" ? "metal" : graphicsInfo.controllers[0].model;
      url = `https://truffle-binaries.s3.amazonaws.com/${serverUpdateInfo}/${osInfo.platform}-${gpu}-${osInfo.arch}.tar.gz`;

      // Add server update size to total bytes to download
      this.addBytesToDownload(await this.getServerUpdateSize(serverUpdateInfo));
    }

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
        // Delete current server folder
        const filePath = path.join(app.getPath("userData"), "bin", "server");
        fs.rmdir(filePath, { recursive: true }, (err) => {
          if (err) {
            console.error(err);
          }
        });

        // Rename new server folder to `server`
        fs.rename(path.join(app.getPath("userData"), "bin", "server_new"), filePath, (err) => {
          if (err) {
            console.error(err);
          }
        });
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
