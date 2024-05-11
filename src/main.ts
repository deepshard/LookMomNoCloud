import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import axios from 'axios';

async function getStats() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    totalMemory,
    freeMemory,
    usedMemory,
  };
}

async function findPid() {
  return new Promise((resolve, reject) => {
    console.log("Finding PID for server");
    let res = spawn("lsof", ["-i", ":8000"]);
    let collectedData = '';

    res.stdout.on('data', function(msg) {
      collectedData += msg.toString().trim();
    });

    res.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        const lines = collectedData.split('\n');
        // Find the first line with a PID after the header (which is usually the second line)
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const parts = lines[i].split(/\s+/);
            const pid = parts[1]; // PID is usually the second column
            const result = parseInt(pid);

            if (!isNaN(result) && result > 0) {
              resolve(result);
              return;
            } else {
              reject(new Error("No valid PID found in output"));
            }
          }
        }
      }
    });

    res.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(new Error(data.toString()));
    });
  })
}

async function startServer(modelName: string) {
  return new Promise((resolve, reject) => {
    console.log(`Starting server for model ${modelName}`);
    let res = spawn("bin/server", ["--cmd", "start_server", "--model", modelName]);
    let collectedData = '';

    res.stdout.on('data', function(msg) {
      console.log(msg.toString().trim());
      collectedData += msg.toString().trim();
    });

    res.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        const result = parseInt(collectedData);
        if (!isNaN(result) && result > 0) {
          resolve(result.toString());
        } else {
          reject(new Error("No valid number found in output"));
        }
      }
    });

    res.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(new Error(data.toString()));
    });
  });
}

async function killServer(pid: number) {
  return new Promise((resolve, reject) => {
    console.log(`Killing server with pid ${pid}`);
    const result = process.kill(pid, 'SIGTERM');

    if (result) {
      resolve(true);
    } else {
      reject(new Error("Failed to kill process"));
    }
  });
}

async function checkForServer() {
  console.log("Checking if a model is already running");

  // Query the v1/models endpoint on localhost to see if the model is already running
  // If it is, return the PID and the name of the model
  try {
    const response = await axios.get('http://localhost:8000/v1/models');

    if (response.status === 200) {
      console.log("Model is already running");
      const modelName = response.data.data[0].id;
      const pid = await findPid();
      return {
        pid,
        name: modelName,
      };
    } else {
      console.log("Model is not running");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  ipcMain.handle('getStats', getStats);
  ipcMain.handle('startServer', async (event, modelName) => {
    const result = await startServer(modelName);
    return result;
  });
  ipcMain.handle('killServer', async (event, pid) => {
    const result = await killServer(pid);
    return result;
  });
  ipcMain.handle('checkForServer', async (event) => {
    const result = await checkForServer();
    return result;
  });
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
