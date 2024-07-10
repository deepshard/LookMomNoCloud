import { app, BrowserWindow, Menu, ipcMain, globalShortcut } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";
import { OTAUpdater } from "./ota";
import { spawn, ChildProcess, exec } from "child_process";
import { log, initializeLogger, endLogger } from "./log";
import fs from "fs";
import { quitApp } from "./api/general";

autoUpdater.autoDownload = false;
autoUpdater.forceDevUpdateConfig = true;

let serverProcess: ChildProcess;
let forceQuit = false;
let mainWindow;

const killServerIfRunning = (port: number) => {
  log(`Attempting to kill server process on port ${port}`);
  const command = `lsof -i :${port} -t`;

  exec(command, (error, stdout) => {
    if (error) {
      log(`Error finding process on port ${port}: ${error}`);
      return;
    }

    const pid = stdout.trim();
    if (pid) {
      log(`Found process ${pid} running on port ${port}. Attempting to kill.`);
      exec(`kill -9 ${pid}`, (error) => {
        if (error) {
          log(`Error killing process ${pid} on port ${port}: ${error}`);
        } else {
          log(`Successfully killed process ${pid} on port ${port}`);
        }
      });
    } else {
      log(`No process found running on port ${port}`);
    }
  });
};

const spawnServer = () => {
  log("Attempting to spawn server");
  killServerIfRunning(8899);

  const serverPath = path.join(app.getPath("userData"), "bin", "server", "server");
  if (!fs.existsSync(serverPath)) {
    log(`Server executable not found at ${serverPath}`);
    return;
  }
  log(`Server executable found at ${serverPath}`);

  const logsPath = path.join(app.getPath("userData"), "bin", "server", "server.log");

  const f = fs.openSync(logsPath, "a+");
  serverProcess = spawn(serverPath, [], {
    detached: true,
    cwd: path.join(app.getPath("userData"), "bin", "server"),
    stdio: ["ignore", f, f],
  });
  log(`Server process spawned with PID: ${serverProcess.pid}`);
  serverProcess.unref();
};

const getVersionHash = () => {
  try {
    const data = fs.readFileSync(path.join(app.getPath("userData"), "bin", "server", "version.txt"), "utf8");
    return data;
  } catch (error) {
    console.error("Error reading file:", error);
  }
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1060,
    height: 800,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 21, y: 21 },
    webPreferences: {
      devTools: !app.isPackaged,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      additionalArguments: [`--app-version=${app.getVersion()}`, `--app-version-hash=${getVersionHash()}`],
    },
  });

  const template = [
    {
      label: "View",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: () => mainWindow.reload() },
        { label: "Toggle Developer Tools", accelerator: "CmdOrCtrl+I", click: () => mainWindow.webContents.toggleDevTools() },
        { label: "Zoom In", accelerator: "CmdOrCtrl+Plus", enabled: false }, // Disabled
        { label: "Zoom Out", accelerator: "CmdOrCtrl+-", enabled: false }, // Disabled
        { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Quit", accelerator: "CmdOrCtrl+Q", role: "quit" },
      ],
    },
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
  // @ts-ignore
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // @ts-ignore
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      `.vite/renderer/main_window/index.html`
      // path.join(__dirname, `../renderer/index.html`)
    );
  }

  // Open the DevTools.
  app.isPackaged && mainWindow.setResizable(false);
  mainWindow.webContents.closeDevTools();

  // Prevent the window from being destroyed when it's closed
  mainWindow.on("close", (event) => {
    if (!forceQuit) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

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
  log("App is ready. Initializing...");
  initializeLogger();
  spawnServer();

  const window = createWindow();
  const otaUpdater = new OTAUpdater(window, autoUpdater);
  ipcMain.on("check-for-updates", otaUpdater.checkForUpdates);
  ipcMain.on("download-update", otaUpdater.downloadUpdate);
  ipcMain.on("restart-and-update", otaUpdater.restartAndInstall);
  autoUpdater.on("download-progress", (progress) => otaUpdater?.updateProgress(progress.delta));
  autoUpdater.on("error", (err) => {
    log(`Error in autoUpdater: ${err}`);
    if (!window.isDestroyed()) {
      window.webContents.send("error", err);
    }
  });
  autoUpdater.on("update-downloaded", () => window.webContents.send("update-downloaded"));

  ipcMain.handle("is-app-packaged", () => app.isPackaged);

  window.on("ready-to-show", async () => {
    const needInitialServer = otaUpdater.checkForInitialServer();
    if (needInitialServer) {
      log("Server not found. Downloading...");
      await otaUpdater.downloadInitialServer();
      log("Initial server download complete");

      log("Spawning server...");
      spawnServer();
    } else {
      log("Initial server already exists");
    }
  });
});


// This intercepts the CMD+Q or Quit menu item
app.on("before-quit", () => {
  quitApp();
  forceQuit = true;
});

app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow?.show();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.d
