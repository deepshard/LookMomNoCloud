import {ReactDOM, useState} from 'react';

interface ModelInfo {
    pid: number;
    name: string;
}

export default function Home() {
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)

    async function loadModel() {
        const res = await window.ipc.launchModel();
        console.log(res);

        setModelInfo({
            pid: res.pid,
            name: "mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC"
        });
    }

    function unloadModel() {
    }

    return (
        <div>
            <button onClick={loadModel}>Load model</button>
            <button onClick={unloadModel}>Unload</button>
        </div>
    )
}

