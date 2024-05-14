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
    return null;
  }
}

export async function downloadModel(modelUrl: string, mainWindow: any) {
  // Assert that the model URL abides by the huggingface model URL format
  const MODEL_PREFIX = "https://huggingface.co/";
  if (!modelUrl.startsWith(MODEL_PREFIX)) throw new Error("Invalid model URL");
  console.log(modelUrl.split("/").length);
  if (modelUrl.split("/").length != 5) throw new Error("Invalid model URL");

  // Parse the user and model name from the URL
  const [user, modelName] = modelUrl.slice(MODEL_PREFIX.length).split("/");
  console.log(`Downloading model ${modelName} from user ${user}`);

  const parentDir = path.join(__dirname, '../..');
  const baseDir = path.resolve(parentDir, `.tmp/${user}/${modelName}`);
  await fs.promises.mkdir(baseDir, { recursive: true });
  console.log(`Created directory ${baseDir}`);
  
  // Get the set of files in the model repo
  const res = await axios.get(`https://huggingface.co/api/models/${user}/${modelName}?`);
  if (res.status != 200) throw new Error("Failed to fetch model data");
  const files = res.data.siblings;
  console.log(`Found ${files.length} files in the model repo`);

  let filesDownloaded = 0;
  const totalFiles = files.length;
  for (const file of files) {
      const fileUrl = `https://huggingface.co/${user}/${modelName}/resolve/main/${file.rfilename}?download=true`;
      const filePath = path.resolve(baseDir, file.rfilename);
      console.log(`Starting download for file ${filesDownloaded + 1}/${totalFiles}: ${file.rfilename}`);
      
      const response = await axios({
          url: fileUrl,
          method: 'GET',
          responseType: 'stream'
      });

      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      const writer = fs.createWriteStream(filePath);

      let bytesDownloaded = 0;
      const totalFileSize = response.headers['content-length'];
      response.data.on('data', (chunk: any) => {
          bytesDownloaded += chunk.length;
          mainWindow.webContents.send('download-progress', {
                "currentFileNum": filesDownloaded + 1,
                "totalFiles": totalFiles,
                "currentProgress": 100 * bytesDownloaded / totalFileSize
          });
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
      });

      console.log(`Finished downloading file ${filesDownloaded + 1}/${totalFiles}`);
      filesDownloaded++;
  }
}
