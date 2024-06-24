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
import unzipper from 'unzipper';


interface ServerUpdateInformation {
  available: boolean;
  url: string;
}

interface AppUpdateInformation {
  available: boolean;
  updateInfo: any;
}

interface DownloadProgress {
  downloadedBytes: number;
  totalBytes: number;
  progress: number;
}

export interface TruffleUpdateInfo {
  server: ServerUpdateInformation,
  app: AppUpdateInformation,
  bytes: number,
}

export class OTAUpdater {
  private mainWindow: BrowserWindow;
  private appUpdater: AppUpdater;
  private downloadProgress: DownloadProgress;
  private updateServer: ServerUpdateInformation = {
    available: false,
    url: "",
  };
  private updateApp: AppUpdateInformation = {
    available: false,
    updateInfo: null,
  };

  constructor(mainWindow: BrowserWindow, appUpdater: AppUpdater) {
    this.mainWindow = mainWindow;
    this.appUpdater = appUpdater;
    this.downloadProgress = {
      downloadedBytes: 0,
      totalBytes: 0,
      progress: 0,
    };
  }

  unzipFile = async (inputPath: string, outputPath: string) => {
    try {
      // Create temp folder
      const tmpPath = path.join(app.getPath("userData"), "bin", "tmp");
      if (!fs.existsSync(tmpPath)) {
        fs.mkdirSync(tmpPath, { recursive: true });
      }

      // Unzip file to temp folder
      await fs.createReadStream(inputPath)
        .pipe(unzipper.Extract({ path: tmpPath }))
        .promise();

      // Find the server folder in the temp folder
      const extractedContents = fs.readdirSync(tmpPath);
      const serverDir = extractedContents.find(dir => fs.statSync(path.join(tmpPath, dir)).isDirectory() && dir === 'server');
      if (!serverDir) {
        throw new Error("Server directory not found in .zip");
      }

      // Move server folder to output path
      fs.renameSync(path.join(tmpPath, serverDir), outputPath);
      fs.rmSync(tmpPath, { recursive: true, force: true });

  
      // Delete .zip
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

  checkForServerUpdate = async () => {
    // Read hash from latest.txt
    const filePath = path.join(app.getPath("userData"), "bin", "server", "version.txt");
    let latestHash = "";
    try {
      latestHash = fs.readFileSync(filePath, "utf8");
    } catch (error) {
      // If file does not exist, we want to just get the latest version from S3
      latestHash = "";
    }
  
    // Get latest hash latest.txt on S3
    const url = "https://truffle-binaries.s3.amazonaws.com/latest.txt";
    let response: any = null;
    try {
      response = await axios.get(url);
    } catch (error) {
      return null;
    }
  
    // Compare hashes
    if (response && latestHash !== response.data) {
      console.log('Server update response:', response.data);
      console.log('Server update latest:', latestHash);
      return response.data.trim();
    }
  
    return null;
  }

  getServerUpdateSize = async (url: string): Promise<number> => {
    const response = await axios.head(url);
    return parseInt(response.headers["content-length"]);
  }
  

  checkForAppUpdate = async () => {
    const appUpdateInfo = await this.appUpdater.checkForUpdates();
    const appUpdateAvailable = appUpdateInfo ? app.getVersion() !== appUpdateInfo.updateInfo.version : false;

    if (appUpdateAvailable) {
      return appUpdateInfo;
    }

    return null;
  }

  getAppUpdateSize = async (appUpdateInfo: any): Promise<number> => {
    const files = appUpdateInfo.updateInfo.files;

    let sizeOfDownload = 0;
    for (let i = 0; i < files.length; i++) {
      if (files[i].size) {
        sizeOfDownload += files[i].size;
      }
    }

    return sizeOfDownload;
  }

  checkForUpdates = async () => {
    // If bin folder does not exist, create it
    const binPath = path.join(app.getPath("userData"), "bin");
    if (!fs.existsSync(binPath)) {
      fs.mkdirSync(binPath, { recursive: true });
    }

    // Check for server and app updates
    const serverUpdateInfo = await this.checkForServerUpdate();
    const appUpdateInfo = null; // await this.checkForAppUpdate();

    // Check if server update is available and track data if so
    if (serverUpdateInfo != null) {
      // Get platform information
      const osInfo = await si.osInfo();
      const graphicsInfo = await si.graphics();
      const gpu = osInfo.platform === "darwin" ? "metal" : graphicsInfo.controllers[0].model;
      const url = `https://truffle-binaries.s3.amazonaws.com/${serverUpdateInfo}/${osInfo.platform}-${gpu}-${osInfo.arch}.zip`;

      this.updateServer = {
        available: true,
        url: url,
      };

      // Add server update size to total bytes to download
      this.addBytesToDownload(await this.getServerUpdateSize(url));
    }

    // Check if app update is available and track data if so
    if (appUpdateInfo != null) {
      this.updateApp = {
        available: true,
        updateInfo: appUpdateInfo,
      };
      this.addBytesToDownload(await this.getAppUpdateSize(appUpdateInfo));
    }

    // Send update information to renderer
    if (this.updateServer.available || this.updateApp.available) {
      this.mainWindow.webContents.send("update-available", {
        server: this.updateServer,
        app: this.updateApp,
        bytes: this.downloadProgress.totalBytes,
      });
    }
  }

  downloadServer = async (url: string, output: string) => {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    // Write stream to file and update progress
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
    await this.unzipFile(filePath, path.join(app.getPath("userData"), "bin", "server_new").toString());
  }

  downloadUpdate = async () => {
    // If no update is available, just return
    if (!this.updateServer.available && !this.updateApp.available) {
      return;
    }

    // Download server updates if available
    if (this.updateServer.available) {
      await this.downloadServer(this.updateServer.url, "server_new.tar.gz");
    }

    // Download app updates if available
    if (this.updateApp.available) {
      await this.appUpdater.downloadUpdate();
    }
  }

  restartAndInstall = () => {
    // If there is a server update, replace the server folder with the new one 
    if (this.updateServer.available) {
      const binPath = path.join(app.getPath("userData"), "bin");
      const serverPath = path.join(binPath, "server");
      const newServerPath = path.join(binPath, "server_new");

      // Delete old server folder (if it exists) and replace with new one
      if (fs.existsSync(serverPath)) {
        fs.rmdirSync(serverPath, { recursive: true });
      }

      fs.renameSync(newServerPath, serverPath);
    }

    // If there is an app update, quit and install
    if (this.updateApp.available) {
      autoUpdater.quitAndInstall();
    }

    // If there is a server update but no app update, relaunch the app
    if (this.updateServer.available) {
      app.relaunch();
      app.quit();
    }
  }
}
