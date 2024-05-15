import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import logger from "../logger";
import { app } from "electron";

function getConvTemplate(modelPath: string) {
    // TODO: implement logic
    return "redpajama_chat";
}

export function isConvertableWeightFormat(modelPath: string): boolean {
    const pytorch_json_path = path.resolve(modelPath, "pytorch_model.bin.index.json");
    const pytorch_bin_path = path.resolve(modelPath, "pytorch_model.bin");
    const safetensors_path = path.resolve(modelPath, "model.safetensors.index.json");
    const safetensors_bin_path = path.resolve(modelPath, "model.safetensors");

    return fs.existsSync(pytorch_json_path) || fs.existsSync(pytorch_bin_path) || fs.existsSync(safetensors_path) || fs.existsSync(safetensors_bin_path);
}

export function mlcChatConfigExistsAndIsValid(modelPath: string): boolean {
    // todo: rename this to truffle.json
    const configPath = path.resolve(modelPath, "mlc-chat-config.json");

    let existsAndValid = false;
    try {
        fs.accessSync(configPath);
        const fileContents = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(fileContents);

        const requiredKeys = ["model_type", "quantization", "model_config", "conv_template"];
        existsAndValid = requiredKeys.every((key) => key in config);
    } catch (error) {
        existsAndValid = false;
    }

    return existsAndValid;
}

export function ndArrayCacheExistsAndIsValid(modelPath: string): boolean {
    const cachePath = path.resolve(modelPath, "ndarray-cache.json");

    let existsAndValid = false;
    try {
        fs.accessSync(cachePath);
        const fileContents = fs.readFileSync(cachePath, "utf-8");
        const cache = JSON.parse(fileContents);

        const baseKeys = ["metadata", "records"];
        const baseKeyValidity = baseKeys.every((key) => key in cache);

        const record = cache["records"][0];
        const recordKeys = ["dataPath", "format", "nbytes", "records", "md5sum"];
        const recordKeysValidity = recordKeys.every((key) => key in record);

        const isDataPathValid = record["dataPath"] === "params_shard_0.bin";
        const isFormatValid = record["format"] === "raw-shard";

        existsAndValid = baseKeyValidity && recordKeysValidity && isDataPathValid && isFormatValid;
    } catch (error) {
        existsAndValid = false;
    }

    return existsAndValid;
}

export async function isMLCFormat(modelPath: string): Promise<boolean> {
    if (!isConvertableWeightFormat(modelPath)) {
        return false;
    }

    if (!mlcChatConfigExistsAndIsValid(modelPath)) {
        return false;
    }

    if (!ndArrayCacheExistsAndIsValid(modelPath)) {
        return false;
    }

    return true;
}

export async function convertModelWeights(modelPath: string, systemRAM: number, modelSize: number) {
    // The python script will automatically determine the proper quantization level
    logger.info("Converting model weights");
    let res = spawn("bin/server", [
        "--cmd",
        "convert_weight",
        "--model_path",
        modelPath,
        "--conv_template",
        getConvTemplate(modelPath),
        "--system_ram",
        systemRAM.toString(),
        "--model_size",
        modelSize.toString(),
    ]);

    const logStream = fs.createWriteStream(path.join(app.getPath("logs"), "server.log"), { flags: "a" });
    res.stdout.pipe(logStream);
    res.stderr.pipe(logStream);

    // Wait for the process to finish
    await new Promise((resolve, reject) => {
        res.on("close", (code: any) => {
            if (code === 0) {
                resolve(null);
            } else {
                logger.error(`Failed to convert model weights. Exit code: ${code}`);
                reject(new Error(`Failed to convert model weights. Exit code: ${code}`));
            }
        });
    });
}

export async function genChatConfig(modelPath: string, systemRAM: number, modelSize: number) {
    logger.info("Generating MLC chat config");
    let res = spawn("bin/server", [
        "--cmd",
        "gen_chat_config",
        "--model_path",
        modelPath,
        "--conv_template",
        getConvTemplate(modelPath),
        "--system_ram",
        systemRAM.toString(),
        "--model_size",
        modelSize.toString(),
    ]);

    const logStream = fs.createWriteStream(path.join(app.getPath("logs"), "server.log"), { flags: "a" });
    res.stdout.pipe(logStream);
    res.stderr.pipe(logStream);

    // Wait for the process to finish
    await new Promise((resolve, reject) => {
        res.on("close", (code: any) => {
            if (code === 0) {
                resolve(null);
            } else {
                logger.error(`Failed to generate chat config. Exit code: ${code}`);
                reject(new Error(`Failed to generate chat config. Exit code: ${code}`));
            }
        });
    });
}
