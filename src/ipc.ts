import axios from "axios";
import { spawn } from "child_process";
import os from "os";
import fs from "fs";
import path from "path";
import settings from "electron-settings";

export async function getStats() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    totalMemory,
    freeMemory,
    usedMemory,
  };
}

export async function startServer(modelName: string) {
  console.log("starting model server...");
  let res = spawn("bin/server", ["--cmd", "start_server", "--model_name", modelName], {
    detached: true,
    stdio: ["pipe"],
  });

  res.unref();

  const logStream = fs.createWriteStream(`truffle.log`, {
    flags: "a",
  });
  res.stdout.pipe(logStream);
  res.stderr.pipe(logStream);

  if (!res.pid) {
    throw new Error("Failed to start server");
  }

  console.log("server started with pid: ", res.pid);

  await settings.set("server", {
    pid: res.pid,
    name: modelName,
  });

  return {
    pid: res.pid,
    name: modelName,
  };
}

export async function killServer() {
  const config = await settings.get("server");

  if (!config) throw new Error("No config found");
  console.log("killing server with pid: ", config.pid);

  const res = process.kill(Number(config.pid));
  if (!res) throw new Error("Failed to kill process");
}

export async function checkForServer() {
  const config = await settings.get("server");

  if (!config) return null;

  try {
    const response = await axios.get("http://127.0.0.1:8000/v1/models");

    if (response.status === 200) {
      return config;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
