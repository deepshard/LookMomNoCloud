import {ReactDOM, useState, useEffect} from 'react';
import toast, { Toaster } from "react-hot-toast";

interface ModelInfo {
    pid: number;
    name: string;
}

export default function Home() {
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)

    useEffect(() => {
        const checkForServer = async () => {
            const res = await window.ipc.checkForServer();
            console.log(res);

            if (res) {
                toast.success(`Model already loaded: ${res.name}`);
                setModelInfo(res);
            }
        }

        checkForServer();
    }, [])

    async function loadModel(modelName: string) {
        try {
            const res = await window.ipc.startServer(modelName);
            console.log(res);

            setModelInfo({
                pid: res,
                name: modelName
            });
            toast.success(`Loaded ${modelName}`)
        } catch (error) {
            toast.error("Failed to start model");
        }
    }

    async function unloadModel() {
        if (!modelInfo) {
            toast.error("No model loaded");
            return;
        }

        const result = await window.ipc.killServer(modelInfo.pid);
        console.log(`Process kill result: ${result}`);

        if (!result) {
            toast.error("Failed to unload model");
            return;
        }

        toast.success(`Unloaded ${modelInfo.name}`);
        setModelInfo(null);
    }

    return (
        <div>
            {modelInfo ? (
                <div>
                    <p>Model: {modelInfo.name}</p>
                    <p>PID: {modelInfo.pid}</p>
                    <button onClick={unloadModel}>Unload</button>
                </div>
            ) : (
                <button onClick={() => loadModel("mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC")}>Load model</button>
            )}
        </div>
    );
}
