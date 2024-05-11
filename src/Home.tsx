import {ReactDOM, useState} from 'react';
import toast, { Toaster } from "react-hot-toast";

interface ModelInfo {
    pid: number;
    name: string;
}

export default function Home() {
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)

    async function loadModel() {
        try {
            const res = await window.ipc.startServer();
            console.log(res);

            setModelInfo({
                pid: res.pid,
                name: "mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC"
            });
        } catch (error) {
            toast.error("Failed to start model");
        }
    }

    async function unloadModel() {
        try {
        await window.ipc.killServer();
        } catch (error) {
        toast.error("Failed to stop model");
        }
    }

    return (
        <div>
            <button onClick={loadModel}>Load model</button>
            <button onClick={unloadModel}>Unload</button>
        </div>
    );
}
