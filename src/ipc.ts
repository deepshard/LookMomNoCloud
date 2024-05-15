import axios from "axios";
import { spawn } from "child_process";
import os from "os";
import fs from "fs";
import path from "path";
import settings from "electron-settings";
import { app } from "electron";
import logger from "./logger";
import { IModelServerInfo } from "./types";

declare global {
  interface Window {
      ipc: {
          startModel: (modelName: string) => Promise<{ pid: string, name: string }>,
          killModel: (pid: string) => Promise<void>,
          startApp: (appName: string) => Promise<void>,
          killApp: (appName: string) => Promise<void>,
          checkForServer: () => Promise<IModelServerInfo | undefined>,
          downloadModel: (modelName: string) => Promise<void>,
          onDownloadProgress: (callback: (data: { model: string, progress: number }) => void) => void,
          onMemoryUsageUpdate: (callback: (data: { pid: number, usage: number }) => void) => void
      };
  }
}

export async function startModel(modelName: string): Promise<{ pid: string, name: string }> {
  // Check that model server is not already running
  let servers = (await settings.get("servers")) as IModelServerInfo | undefined;

  if (servers && Object.values(servers).includes(modelName)) {
    throw new Error("Model server already running");
  }

  // Start the model server
  logger.info(`Starting model server for ${modelName}`);
  const res = spawn("bin/server", ["--cmd", "start_server", "--model_name", modelName], {
    detached: true,
    stdio: ["pipe"],
  });

  res.unref();

  // Log stdout and stderr
  const logStream = fs.createWriteStream(path.join(app.getPath("logs"), "server.log"), { flags: "a" });
  
  res.stdout.pipe(logStream);
  res.stderr.pipe(logStream);

  // Check that the server started successfully
  if (!res.pid) {
    throw new Error("Failed to start server");
  }

  logger.info(`Server started with pid: ${res.pid}`);

  // Update the server config
  if (servers) {
    servers[res.pid.toString()] = modelName;
  } else {
    servers = {
      [res.pid.toString()]: modelName,
    };
  }
  await settings.set("servers", servers);

  return {
    pid: res.pid.toString(),
    name: modelName,
  };
}

export async function killModel(pid: string): Promise<void> {
  const servers = (await settings.get("servers")) as IModelServerInfo | undefined;
  if (!servers) throw new Error("No servers found");

  // Kill the server
  const res = process.kill(Number(pid));
  if (!res) throw new Error("Failed to kill process");

  // Update the server config
  delete servers[pid];
  await settings.set("servers", servers);
}

export async function startApp(appName: string): Promise<void> {
  // TODO: implement
}

export async function killApp(appName: string): Promise<void> {
  // TODO: implement
}

export async function checkForServer(): Promise<IModelServerInfo | undefined> {
  const config = (await settings.get("server")) as IModelServerInfo | undefined;

  if (!config) return null;

  // TODO: This should check that the actual processes tracked in the config are still running
  // and update the config accordingly
  try {
    await axios.get("http://127.0.0.1:8899/v1/models");
    console.log("Server found");
    return config;
  } catch (error) {
    console.log("No server found");
    await settings.set("server", null);
    return null;
  }
}
