// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("ipc", {});

import { contextBridge, shell } from 'electron';

contextBridge.exposeInMainWorld('electronShell', {
  openExternal: (url) => shell.openExternal(url)
});