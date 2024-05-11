// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipc', {
  getStats: () => ipcRenderer.invoke('getStats'),
  startServer: () => ipcRenderer.invoke('startServer'),
  killServer: () => ipcRenderer.invoke('killServer')
});

