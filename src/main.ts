import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import { checkForServer, killApp, killModel, startApp, startModel } from "./ipc";
import { ModelManager } from "./ModelManager";
import { getPidMemoryUsage, getDiskUsage } from "./utils/sysUtils";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    backgroundMaterial: "acrylic",
    vibrancy: "fullscreen-ui",
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

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

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function () {
  const mainWindow = createWindow();
  const modelManager = new ModelManager(mainWindow);

  ipcMain.handle("startModel", async (event, modelName) => await startModel(modelName));
  ipcMain.handle("killModel", async (event, pid) => await killModel(pid));

  ipcMain.handle("startApp", async (event, appName) => await startApp(appName));
  ipcMain.handle("killApp", async (event, pid) => await killApp(pid));

  ipcMain.handle("checkForServer", async (event) => {
    const result = await checkForServer();
    return result;
  });
  ipcMain.handle("downloadModel", async (event, modelUrl) => {
    await modelManager.downloadModel(modelUrl);
  });

  // Background task for clearing install queue (runs every 30 seconds)
  setInterval(async () => {
    await modelManager.installModel();

    // TODO: Add memory and disk usage updates
  }, 60000); 
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
