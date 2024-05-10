import React from 'react';

export default function Home() {
    async function loadModel() {
        const res = await window.ipc.getStats()
        console.log(res)
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

