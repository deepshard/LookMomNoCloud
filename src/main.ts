import { app, BrowserWindow, session, screen } from "electron";
import path from "path";
import os from "os";
import { spawn } from "child_process";

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
  const serverPath = path.join(app.getPath("userData"), "bin", "server", "server");
  const serverProcess = spawn(serverPath, [], {
    detached: true,
    cwd: path.join(app.getPath("userData"), "bin", "server"),
  });
  serverProcess.unref();

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
