import axios from "axios";
import { spawn } from "child_process";
import os from "os";
import fs from "fs";
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

  const logStream = fs.createWriteStream(`server.log`, {
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
  const config = await settings.get("server");
  console.log("config: ", config);

  return {
    pid: res.pid,
    name: modelName,
  };

  // //   return new Promise((resolve, reject) => {
  // //     console.log(`Starting server for model ${modelName}`);
  // //     let collectedData = "";

  // //     res.stdout.on("data", function (msg) {
  // //       console.log(msg.toString().trim());
  // //       collectedData += msg.toString().trim();
  // //     });

  // //     res.on("close", (code) => {
  // //       if (code !== 0) {
  // //         reject(new Error(`Process exited with code ${code}`));
  // //       } else {
  // //         const result = parseInt(collectedData);
  // //         if (!isNaN(result) && result > 0) {
  // //           resolve(result.toString());
  // //         } else {
  // //           reject(new Error("No valid number found in output"));
  // //         }
  // //       }
  // //     });

  // //     res.stderr.on("data", (data) => {
  // //       console.error(`stderr: ${data}`);
  // //       reject(new Error(data.toString()));
  // //     });
  //   });
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
    console.error("error checking for server", error);
    return null;
  }
}
