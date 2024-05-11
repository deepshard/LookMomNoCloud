import axios from "axios";
import { spawn } from "child_process";
import os from "os";

export async function findPid() {
  return new Promise((resolve, reject) => {
    console.log("Finding PID for server");
    let res = spawn("lsof", ["-i", ":8000"]);
    let collectedData = "";

    res.stdout.on("data", function (msg) {
      collectedData += msg.toString().trim();
    });

    res.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        const lines = collectedData.split("\n");
        // Find the first line with a PID after the header (which is usually the second line)
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const parts = lines[i].split(/\s+/);
            const pid = parts[1]; // PID is usually the second column
            const result = parseInt(pid);

            if (!isNaN(result) && result > 0) {
              resolve(result);
              return;
            } else {
              reject(new Error("No valid PID found in output"));
            }
          }
        }
      }
    });

    res.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      reject(new Error(data.toString()));
    });
  });
}

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
  return new Promise((resolve, reject) => {
    console.log(`Starting server for model ${modelName}`);
    let res = spawn("bin/server", [
      "--cmd",
      "start_server",
      "--model",
      modelName,
    ]);
    let collectedData = "";

    res.stdout.on("data", function (msg) {
      console.log(msg.toString().trim());
      collectedData += msg.toString().trim();
    });

    res.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        const result = parseInt(collectedData);
        if (!isNaN(result) && result > 0) {
          resolve(result.toString());
        } else {
          reject(new Error("No valid number found in output"));
        }
      }
    });

    res.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      reject(new Error(data.toString()));
    });
  });
}

export async function killServer(pid: number) {
  return new Promise((resolve, reject) => {
    console.log(`Killing server with pid ${pid}`);
    const result = process.kill(pid, "SIGTERM");

    if (result) {
      resolve(true);
    } else {
      reject(new Error("Failed to kill process"));
    }
  });
}

export async function checkForServer() {
  console.log("Checking if a model is already running");

  // Query the v1/models endpoint on localhost to see if the model is already running
  // If it is, return the PID and the name of the model
  try {
    const response = await axios.get("http://localhost:8000/v1/models");

    if (response.status === 200) {
      console.log("Model is already running");
      const modelName = response.data.data[0].id;
      const pid = await findPid();
      return {
        pid,
        name: modelName,
      };
    } else {
      console.log("Model is not running");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
