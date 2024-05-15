import { ReactDOM, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import ModelWidget from "./component/ModelWidget";
import useStore from "./store";

interface DownloadProgress {
  currentFileNum: number;
  totalFiles: number;
  currentProgress: number;
}

interface ModelInfo {
  pid: number;
  name: string;
}

const MODEL_LIST = [
  {
    name: "Llama",
    from: "Meta",
    size: 3000000000,
    description: "Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
  },
  {
    name: "Phi",
    from: "Together Computer",
    size: 3000000000,
    description: "Phi is a model designed by Together Computer. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
  },
  {
    name: "RedPajama",
    from: "Together Computer",
    size: 200000000,
    description: "RedPajama is a model designed by Together Computer. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
  },
  {
    name: "GPT-4",
    from: "OpenAI",
    size: 1000000000,
    description: "GPT-4 is a model designed by OpenAI. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
  },
  {
    name: "GPT-3.5",
    from: "OpenAI",
    size: 1000000000,
    description: "GPT-3.5 is a model designed by OpenAI. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
  },
];

export default function Home() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [modelResponse, setModelResponse] = useState<string | null>(null);


  
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
      await window.ipc.startModel(modelName);

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
      timePassed += 1000;
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
      await window.ipc.killModel();
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
    const response = await fetch("http://127.0.0.1:8899/v1/chat/completions", {
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
      <button onClick={downloadModel}>Download model</button>
      <div className="flex gap-4">
        {MODEL_LIST.map((model) => (
          <ModelWidget {...model} key={model.name} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 lg:gap-10 mt-[34.89px]">
        <div className="col-span-1 flex flex-col gap-4 justify-between min-w-[263px] w-full h-[280px] lg:h-[353.19px]">
          <div className="w-full h-[158px] relative border-[#D9D9D94D] rounded-md border-4 overflow-hidden">
            <img src="/assets/images/llama1.png" alt="" className="blurred-bg-img backdrop-blur-md" />
            <div className="absolute top-0 left-0 bg-white/20 w-full h-full backdrop-blur-lg" />
            <div className="absolute top-0 left-0 p-[16px]">
              <img src="/assets/images/llama1.png" alt="" className="w-[44px] h-[44px] rounded-md" />
              <h3 className="base-regular">Deep Sak</h3>
            </div>
          </div>

          <div className="w-full h-[158px] bg-black flex justify-between gap-3">
            <div className="min-w-[153.71px] md:w-[263.71px] h-full bg-blue-400"></div>
            <div className="min-w-[153.71px] md:w-[263.71px] h-full bg-blue-400"></div>
          </div>
        </div>
        <div className="col-span-1 bg-red-400 min-w-[263px] w-full h-[280px] lg:h-[353.19px]"></div>
      </div>
    </div>
  );
}
