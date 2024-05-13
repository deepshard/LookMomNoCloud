// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipc", {
  getStats: () => ipcRenderer.invoke("getStats"),
  startServer: (modelName: string) =>
    ipcRenderer.invoke("startServer", modelName),
  killServer: () => ipcRenderer.invoke("killServer"),
  checkForServer: () => ipcRenderer.invoke("checkForServer"),
  downloadModel: (modelUrl: string) =>
    ipcRenderer.invoke("downloadModel", modelUrl),
  onDownloadProgress: (callback: any) => ipcRenderer.on('download-progress', (_event, value) => callback(value)),
});
