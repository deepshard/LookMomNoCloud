import { app, BrowserWindow, session, screen, Menu, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";
import os from "os";
import { OTAUpdater } from "./ota";

autoUpdater.autoDownload = false;
autoUpdater.forceDevUpdateConfig = true;


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
      path.join(__dirname, `../dist/index.html`)
    );
  }
  
  // Open the DevTools.
<<<<<<< HEAD
  process.env.NODE_ENV === "development" && mainWindow.webContents.openDevTools();
  process.env.NODE_ENV !== "development" && mainWindow.setResizable(false);

=======
  mainWindow.webContents.openDevTools();
  // process.env.NODE_ENV !== "development" && mainWindow.setResizable(false);
  
>>>>>>> 8da5e13 (stash)
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async function () {
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
  
  const window = createWindow();
  const otaUpdater = new OTAUpdater(window, autoUpdater);
  ipcMain.on("download-update", otaUpdater.downloadUpdate);
  ipcMain.on("restart-and-update", otaUpdater.restartAndInstall);
  autoUpdater.on("download-progress", (progress) => otaUpdater?.updateProgress(progress.delta));
  await otaUpdater.checkForUpdates();
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
// code. You can also put them in separate files and import them here.d