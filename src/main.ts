import { app, BrowserWindow, session, screen, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";
import os from "os";
import si from "systeminformation";
import axios from "axios";
import fs from "fs";
import zlib from "zlib";
import stream from "stream";
import { promisify } from "util";

const downloadServer = async (output: string) => {
  const version = app.getVersion();
  const osInfo = await si.osInfo();
  const graphicsInfo = await si.graphics();
  const gpu = osInfo.platform === "darwin" ? "metal" : graphicsInfo.controllers[0].model;

  // TODO: Set up with correct URL
  const url = `https://update-server.com/api/versions/${version}/${osInfo.platform}/${osInfo.arch}/${gpu}`;
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    // Download gzip to bin, then unzip it
    const pipeline = promisify(stream.pipeline);
    const filePath = path.join(app.getPath("userData"), "bin", output);
    const writeStream = fs.createWriteStream(filePath);
    await pipeline(response.data, zlib.createGunzip(), writeStream);
  } catch (error) {
    console.error(error);
  }
}

const handleUpdate = async () => {
  // Download new server zip
  await downloadServer("server_new.zip")

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

  // Update app
  autoUpdater.quitAndInstall();
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const factor = screen.getPrimaryDisplay().scaleFactor;
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 950 ,
    height: 690 ,
    titleBarStyle: "hidden",
    webPreferences: {
      // devTools: false,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),

    },
  });

  autoUpdater.on("checking-for-update", () => mainWindow.webContents.send("checking-for-update"));
  autoUpdater.on("update-available", () => mainWindow.webContents.send("update-available"));
  autoUpdater.on("update-not-available", () => mainWindow.webContents.send("update-not-available"));
  autoUpdater.on("download-progress", (progress) => mainWindow.webContents.send("download-progress", progress));
  autoUpdater.on("error", (err) => mainWindow.webContents.send("error", err));

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  process.env.NODE_ENV !== "development" && mainWindow.setResizable(false);

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async function () {
  await downloadServer("server.zip");
  autoUpdater.checkForUpdates();

  // todo: spawn the flask server here
  // on macOS
  const reactDevToolsPath = path.join(
    os.homedir(),
    "/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/5.2.0_4"
  );

  const reduxTools = path.join(
    os.homedir(),
    "/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/3.1.6_0"
  );

  try {
    await session.defaultSession.loadExtension(reactDevToolsPath);
    await session.defaultSession.loadExtension(reduxTools);
  } catch (error) {
    console.error("Failed to install extension:", error);
  }

  ipcMain.on("restart-and-update", handleUpdate);
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.