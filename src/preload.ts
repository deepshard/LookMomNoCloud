// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, shell, app } from "electron";

contextBridge.exposeInMainWorld("ipc", {
  downloadUpdate: () => ipcRenderer.send("download-update"),
  restartAndUpdate: () => ipcRenderer.send("restart-and-update"),
  onDownloadUpdateProgress: (callback) => ipcRenderer.on("update-download-progress", (_event, value) => callback(value)),
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", (_event, value) => callback(value)),
  onError: (callback) => ipcRenderer.on("error", (_event, value) => callback(value)),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update-downloaded", callback),
  onInitializationRequired: (callback) => ipcRenderer.on("initialization-required", callback),
  onInitializationComplete: (callback) => ipcRenderer.on("initialization-complete", callback),
});

contextBridge.exposeInMainWorld('electronShell', {
  openExternal: (url) => shell.openExternal(url)
});

contextBridge.exposeInMainWorld('electronAPI', {
  isPackaged: () => ipcRenderer.invoke('is-app-packaged')
})