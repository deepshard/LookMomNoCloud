import fs from "fs";
import path from "path";
import { app } from "electron";

let logStream: fs.WriteStream;

const initializeLogger = () => {
    const logsPath = path.join(app.getPath("userData"), "client.log");
    logStream = fs.createWriteStream(logsPath, { flags: 'a+' });
}

const log = (message: string) => {
    if (logStream && logStream.writable) {
        const timestamp = new Date().toISOString();
        logStream.write(`[${timestamp}] ${message}\n`);
    }
}

const endLogger = () => {
    if (logStream) {
        logStream.end();
    }
}



export { log, initializeLogger, endLogger };

