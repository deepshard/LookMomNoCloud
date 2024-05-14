import { ReactDOM, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import ModelWidget from "./component/ModelWidget";

interface DownloadProgress {
  currentFileNum: number;
  totalFiles: number;
  currentProgress: number;
}

interface ModelInfo {
  pid: number;
  name: string;
}

export default function Home() {
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [modelResponse, setModelResponse] = useState<string | null>(null);

  window.ipc.onDownloadProgress((data: any) => {
    setDownloadProgress(data);
  });

  const checkForServer = async () => {
    try {
      const res = await window.ipc.checkForServer();
      if (res) {
        setModelInfo(res);
      }
    } catch (error) {
      toast.error("Failed to check for server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkForServer();
  }, []);

  async function loadModel(modelName: string) {
    try {
      toast.success(`Loading...`);
      await window.ipc.startServer(modelName);

      let timePassed = 0;
      let res = null;
      while (!res && timePassed < 30000) {
        res = await window.ipc.checkForServer();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        timePassed += 1000;
      }

      if (res) {
        setModelInfo(res);
        toast.success(`Loaded ${modelName}`);
      } else {
        toast.error("Failed to load model");
      }
    } catch (error) {
      toast.error("Failed to start model");
    }
  }

  async function downloadModel() {
    await window.ipc.downloadModel("togethercomputer/RedPajama-INCITE-Instruct-3B-v1");

    let timePassed = 0;
    let res = null;
    while (!res && timePassed < 10 * 60 * 1000) {
      res = await window.ipc.checkForServer();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      timePassed += 1000
    }

    if (res) {
      setModelInfo(res);
      toast.success(`Loaded togethercomputer/RedPajama-INCITE-Instruct-3B-v1`);
    } else {
      toast.error("Failed to load model");
    }
  }

  async function unloadModel() {
    try {
      await window.ipc.killServer();
    } catch (error) {
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelInfo?.name,
        messages: [{ role: "user", content: userMessage }],
        stream: true,
      }),
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
      if (chunkText.startsWith("data: ")) {
        chunkText = chunkText.slice(6);
      }

      let model_response_delta: any;
      try {
        model_response_delta = JSON.parse(chunkText).choices[0].delta.content;
      } catch (error) {
        model_response_delta = "";
      }

      currentText += model_response_delta;
      setModelResponse(currentText); // Update the state with the current accumulated text

      return reader.read().then(processText);
    });
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {/* <button onClick={downloadModel}>Download model</button>
      {downloadProgress && (
        <p>
          Downloading file {downloadProgress.currentFileNum}/{downloadProgress.totalFiles} - {downloadProgress.currentProgress}% complete
        </p>
      )}
      {modelInfo ? (
        <div>
          <p>Model: {modelInfo.name}</p>
          <p>PID: {modelInfo.pid}</p>
          <button onClick={unloadModel}>Unload</button>
          <input type="text" onChange={(e) => setUserMessage(e.target.value)} placeholder="Enter a message" />
          <button onClick={sendMessage}>Send</button>
          {modelResponse && <p>Response: {modelResponse}</p>}
        </div>
      ) : (
        <button className="text-blue-500" onClick={() => loadModel("mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC")}>
          Load model
        </button>
      )} */}

      <h1 className="h1-semibold mb-2">Welcome, Peter</h1>
      <div className="flex gap-4">
        {[1,2,3,4].map((i) => (
          <ModelWidget key={i} />
        ))}
      </div>
    </div>
  );
}
