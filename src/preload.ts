// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, shell } from "electron";



const appVersion = process.argv.find(arg => arg.startsWith('--app-version='))?.split('=')[1];
const appVersionHash = process.argv.find(arg => arg.startsWith('--app-version-hash='))?.split('=')[1];

contextBridge.exposeInMainWorld("ipc", {
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
  downloadUpdate: () => ipcRenderer.send("download-update"),
  restartAndUpdate: () => ipcRenderer.send("restart-and-update"),
  onDownloadUpdateProgress: (callback) => ipcRenderer.on("update-download-progress", (_event, value) => callback(value)),
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", (_event, value) => callback(value)),
  onError: (callback) => ipcRenderer.on("error", (_event, value) => callback(value)),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update-downloaded", callback),
  onInitializationCheck: (callback) => ipcRenderer.on("initialization", (_event, value) => callback(value)),
  onInitializationComplete: (callback) => ipcRenderer.on("initialization-complete", callback),
});

contextBridge.exposeInMainWorld('electronShell', {
  openExternal: (url) => shell.openExternal(url)
});

contextBridge.exposeInMainWorld('electronAPI', {
  isPackaged: () => ipcRenderer.invoke('is-app-packaged'),
  getAppVersion: () => appVersion,
  getAppVersionHash: () => appVersionHash
})