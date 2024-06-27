import { app, BrowserWindow, Menu, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";
import { OTAUpdater } from "./ota";
import { spawn, ChildProcess } from "child_process";
import { log, initializeLogger, endLogger } from "./log";
import fs from "fs";

autoUpdater.autoDownload = false;
autoUpdater.forceDevUpdateConfig = true;

let serverProcess: ChildProcess;

const spawnServer = () => {
  const serverPath = path.join(app.getPath("userData"), "bin", "server", "server");
  if (!fs.existsSync(serverPath)) {
    log(`Server executable not found at ${serverPath}`);
    return;
  }
  const logsPath = path.join(app.getPath("userData"), "bin", "server", "server.log");
  const f = fs.openSync(logsPath, "a+");
  serverProcess = spawn(serverPath, [], {
    detached: true,
    cwd: path.join(app.getPath("userData"), "bin", "server"),
    stdio: ["ignore", f, f],
  });
  serverProcess.unref();
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 950,
    height: 690,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 21, y: 21 },
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  autoUpdater.on("error", (err) => mainWindow.webContents.send("error", err));

  const template = [
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'Toggle Developer Tools', accelerator: 'CmdOrCtrl+I', click: () => mainWindow.webContents.toggleDevTools() },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', enabled: false },  // Disabled
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', enabled: false },   // Disabled
      ]
    },
    {
      label: "Version",
      submenu: [
        { label: `${app.getVersion()}`, enabled: false },
      ]
    }
  ];

  setTimeout(() => {
    mainWindow.webContents.setZoomLevel(0);
  }, 100);

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Disable zoom shortcuts
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if ((input.control || input.meta) && (input.key === "+" || input.key === "-" || input.key === "=" || input.key === "0")) {
      event.preventDefault();
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      `.vite/renderer/main_window/index.html`
      // path.join(__dirname, `../renderer/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.setResizable(false);
  mainWindow.webContents.closeDevTools();

  // if (process.env.NODE_ENV === "development") {
  //   mainWindow.webContents.openDevTools();
  //   mainWindow.setResizable(true);
  // }

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async function () {
  initializeLogger()
  spawnServer();

  const window = createWindow();
  const otaUpdater = new OTAUpdater(window, autoUpdater);
  ipcMain.on("download-update", otaUpdater.downloadUpdate);
  ipcMain.on("restart-and-update", otaUpdater.restartAndInstall);
  autoUpdater.on("download-progress", (progress) => otaUpdater?.updateProgress(progress.delta));
  autoUpdater.on("error", (err) => window.webContents.send("error", err));
  autoUpdater.on("update-downloaded", () => window.webContents.send("update-downloaded"));

  window.on("ready-to-show", async () => {
    log("Checking for initial server");
    const needInitialServer = otaUpdater.checkForInitialServer();
    if (needInitialServer) {
      log("Downloading initial server");
      await otaUpdater.downloadInitialServer();
    }

    log("Spawning server");
    spawnServer();
    log("Checking for updates");
    await otaUpdater.checkForUpdates();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
    log("Server process killed");
  }
  log("Quitting");
  endLogger();
  app.quit();
});



app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    // const otaUpdater = new OTAUpdater(window, autoUpdater);
    // ipcMain.on("download-update", otaUpdater.downloadUpdate);
    // ipcMain.on("restart-and-update", otaUpdater.restartAndInstall);
    // autoUpdater.on("download-progress", (progress) => otaUpdater?.updateProgress(progress.delta));
    // await otaUpdater.checkForUpdates();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.d