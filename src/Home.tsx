import {ReactDOM, useState, useEffect} from 'react';
import toast, { Toaster } from "react-hot-toast";

interface ModelInfo {
    pid: number;
    name: string;
}

export default function Home() {
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
    const [userMessage, setUserMessage] = useState<string | null>(null);
    const [modelResponse, setModelResponse] = useState<string | null>(null);

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

    async function sendMessage() {
        if (!modelInfo) {
            toast.error("No model loaded");
            return;
        }

        console.log("Sending message");
        const response = await fetch("http://127.0.0.1:8000/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": modelInfo?.name,
                "messages": [
                    {"role": "user", "content": userMessage}
                ],
                "stream": true
            })
        });

        const reader = response?.body?.getReader();
        let currentText = "";
  
        // Process the stream
        reader?.read().then(function processText({ done, value }): any {
            if (done) {
                console.log("Stream complete");
                return;
            }
        
            // Decode and handle the chunk and parse the JSON
            let chunkText = new TextDecoder("utf-8").decode(value);
            if (chunkText.startsWith('data: ')) {
                chunkText = chunkText.slice(6);
            }

            let model_response_delta: any;
            try {
                model_response_delta = JSON.parse(chunkText).choices[0].delta.content;
            } catch (error) {
                model_response_delta = "";
            }

            currentText += model_response_delta;
            setModelResponse(currentText);  // Update the state with the current accumulated text
        
            return reader.read().then(processText);
        });
    }

    return (
        <div>
            {modelInfo ? (
                <div>
                    <p>Model: {modelInfo.name}</p>
                    <p>PID: {modelInfo.pid}</p>
                    <button onClick={unloadModel}>Unload</button>
                    <input
                        type="text"
                        onChange={(e) => setUserMessage(e.target.value)}
                        placeholder="Enter a message"
                    />
                    <button onClick={sendMessage}>Send</button>
                    {modelResponse && <p>Response: {modelResponse}</p>}
                </div>
            ) : (
                <button onClick={() => loadModel("mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC")}>Load model</button>
            )}
        </div>
    );
}
