// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipc", {
  startModel: (modelName: string) =>
    ipcRenderer.invoke("startModel", modelName),
  killModel: (pid: number) => ipcRenderer.invoke("killModel", pid),
  startApp: (appName: string) => ipcRenderer.invoke("startApp", appName),
  killApp: (pid: number) => ipcRenderer.invoke("killApp", pid),
  checkForServer: () => ipcRenderer.invoke("checkForServer"),
  downloadModel: (modelUrl: string) =>
    ipcRenderer.invoke("downloadModel", modelUrl),
  onDownloadProgress: (callback: any) =>
    ipcRenderer.on("download-progress", (_event, value) => callback(value)),
  onMemoryUsageUpdate: (callback: any) =>
    ipcRenderer.on("memory-usage-update", (_event, value) => callback(value)),
});
