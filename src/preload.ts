// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("ipc", {
  downloadUpdate: () => ipcRenderer.send("download-update"),
  restartAndUpdate: () => ipcRenderer.send("restart-and-update"),
  onDownloadUpdate: (callback) => ipcRenderer.on("download-update", (_event, value) => callback(value)),
});
