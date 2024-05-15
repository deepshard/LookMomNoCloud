import axios from "axios";
import { spawn } from "child_process";
import os from "os";
import fs from "fs";
import path from "path";
import settings from "electron-settings";
import { app } from "electron";
import logger from "./logger";

declare global {
  // todo: add types for ipc
  interface Window {
      ipc: {
          startModel: any,
          killModel: any,
          startApp: any,
          killApp: any,
          checkForServer: any,
          downloadModel: any,
          onDownloadProgress: any,
          onMemoryUsageUpdate: any
      };
  }
}

interface Servers {
  [key: string]: string;
}

export async function startModel(modelName: string) {
  // Check that model server is not already running
  let servers = (await settings.get("servers")) as Servers | undefined;

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

export async function killModel(pid: string) {
  const servers = (await settings.get("servers")) as Servers | undefined;
  if (!servers) throw new Error("No servers found");

  // Kill the server
  const res = process.kill(Number(pid));
  if (!res) throw new Error("Failed to kill process");

  // Update the server config
  delete servers[pid];
  await settings.set("servers", servers);
}

export async function startApp(appName: string) {
  // TODO: implement
}

export async function killApp(appName: string) {
  // TODO: implement
}

export async function checkForServer() {
  const config = (await settings.get("server")) as Servers | undefined;

  if (!config) return null;
  await axios.get("http://127.0.0.1:8899/v1/models");
  return config;
}
