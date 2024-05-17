import { ReactDOM, useState, useEffect, useLayoutEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import ModelWidget, { ModelWidgetState } from "./component/ModelWidget";
import useStore, { Command } from "./store";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import { IModel, IModelServerInfo } from "./types";
import { Button } from "antd";
import CustomCarouselDot from "./component/CustomCarouselDot";

const MODEL_LIST: IModel[] = [
  {
    id: "0",
    title: "Llama",
    author: "Meta",
    size: 3000000000,
    downloads: 120,
    risks:
      "Risks: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    capabilities:
      "Capabilities:Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    intro:
      "Intro: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    hfLink:
      "https://huggingface.co/togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
    likes: 70,
  },
  {
    id: "1",
    title: "Llama",
    author: "Meta",
    size: 3000000000,
    downloads: 120,
    risks:
      "Risks: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    capabilities:
      "Capabilities:Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    intro:
      "Intro: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    hfLink:
      "https://huggingface.co/togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
    likes: 70,
  },
  {
    id: "2",
    title: "Llama",
    author: "Meta",
    size: 3000000000,
    downloads: 120,
    risks:
      "Risks: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    capabilities:
      "Capabilities:Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    intro:
      "Intro: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    hfLink:
      "https://huggingface.co/togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
    likes: 70,
  },
  {
    id: "3",
    title: "Llama",
    author: "Meta",
    size: 3000000000,
    downloads: 120,
    risks:
      "Risks: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    capabilities:
      "Capabilities:Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    intro:
      "Intro: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    hfLink:
      "https://huggingface.co/togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
    likes: 70,
  },
  {
    id: "4",
    title: "Llama",
    author: "Meta",
    size: 3000000000,
    downloads: 120,
    risks:
      "Risks: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    capabilities:
      "Capabilities:Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    intro:
      "Intro: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    hfLink:
      "https://huggingface.co/togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
    likes: 70,
  },
];

export default function Home() {
  const [modelInfo, setModelInfo] = useState<IModelServerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [modelResponse, setModelResponse] = useState<string | null>(null);
  // const { downloadProgress } = useStore((state) => state);
  const sendCommand = useStore((state) => state.sendCommand);

  const llamaImage = process.env.NODE_ENV === "development" ? "/assets/icons/llama1.png" : "../../renderer/main_window/assets/icons/llama1.png";
  const truffleHardwareImage = process.env.NODE_ENV === "development" ? "/assets/icons/truffle-hardware.png" : "../../renderer/main_window/assets/icons/truffle-hardware.png";

  const checkForServer = async () => {
    try {
      // const res = await window.ipc.checkForServer();
      // if (res) {
      //   setModelInfo(res);
      // }
    } catch (error) {
      toast.error("Failed to check for server");
    } finally {
      setLoading(false);
    }
  };

  async function loadModel(modelName: string) {
    try {
      toast.success(`Loading...`);
      // await window.ipc.startModel(modelName);

      let timePassed = 0;
      let res = null;
      while (!res && timePassed < 30000) {
        // res = await window.ipc.checkForServer();
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

  async function downloadModel(model: IModel) {
    try {
      console.log("Downloading model - 1");
      const modelPathName = model.hfLink.split("/").slice(3).join("/");

      // await window.ipc.downloadModel("togethercomputer/RedPajama-INCITE-Instruct-3B-v1");
      // await window.ipc.downloadModel(modelPathName);

      let timePassed = 0;
      let res = null;
      // while (!res && timePassed < 10 * 60 * 1000) {
      //   res = await window.ipc.checkForServer();
      //   if (res) break;
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      //   timePassed += 1000;
      // }

      if (res) {
        setModelInfo(res);
        console.log("Successfully downloaded model");
        toast.success(
          `Loaded togethercomputer/RedPajama-INCITE-Instruct-3B-v1`
        );
      } else {
        console.log("Failed to download model");
        toast.error("Failed to load model");
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function unloadModel(pid: string) {
    try {
      // await window.ipc.killModel(pid);
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

  const getWidgetState = (model: IModel): ModelWidgetState => {
    const modelPathName = model.hfLink.split("/").slice(3).join("/");
    // if (
    //   downloadProgress[modelPathName] > 0 &&
    //   downloadProgress[modelPathName] < 100
    // ) {
    //   return "downloading";
    // }
    return "not-downloaded";
  };

  return (
    <button
      onClick={() => {
        sendCommand(Command.SYSINFO, {});
      }}
    >
      HOME
    </button>
  );

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
      {/* <button onClick={downloadModel}>Download model</button> */}
      <div className="flex gap-4">
        {MODEL_LIST.map((model) => (
          <ModelWidget
            model={model}
            key={model.id}
            widgetState={getWidgetState(model)}
            downloadModel={downloadModel}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 lg:gap-10 mt-[34.89px]">
        <div className="col-span-1 flex flex-col gap-4 justify-between min-w-[263px] w-full h-[280px] lg:h-[353.19px]">
          <div className="relative">
            <Carousel
              responsive={{
                desktop: {
                  breakpoint: { max: 3000, min: 1024 },
                  items: 1,
                },
                tablet: {
                  breakpoint: { max: 1024, min: 464 },
                  items: 1,
                },
              }}
              arrows={false}
              autoPlay
              showDots
              infinite
              className="border-[#D9D9D94D] border-4 rounded-md"
              customDot={<CustomCarouselDot />}
              dotListClass="discover-carousel-dots"
            >
              <div className="w-full h-[158px] relative overflow-hidden ">
                <img
                  src={llamaImage}
                  alt=""
                  className="blurred-bg-img backdrop-blur-md"
                />
                <div className="absolute top-0 left-0 bg-white/20 w-full h-full backdrop-blur-lg" />
                <div className="absolute top-0 left-0 p-[16px]">
                  <img
                    src={llamaImage}
                    alt=""
                    className="discover-model-img w-[44px] h-[44px] rounded-md"
                  />
                  <h3 className="base-regular mt-[10px] mb-[3px]">DeepSeek</h3>
                  <p className="break-words line-clamp-2 base-regular">
                    lorem ipsum dolor sit amet consectetur adipiscing elit etiam
                    consectetur elementum mattis aliquam vulputate consectetur
                    etiam consectetur lorem ipsum dolor sit amet consectetur
                    adipiscing elit etiam consectetur elementum mattis aliquam
                    vulputate consectetur etiam consectetur lorem ipsum dolor
                    sit amet consectetur adipiscing elit etiam consectetur
                    elementum mattis aliquam vulputate consectetur etiam
                    consectetur lorem ipsum dolor sit amet consectetur
                    adipiscing elit etiam consectetur elementum mattis aliquam
                    vulputate consectetur etiam consectetur
                  </p>
                </div>
              </div>
              <div className="w-full h-[158px] relative overflow-hidden ">
                <img
                  src={llamaImage}
                  alt=""
                  className="blurred-bg-img backdrop-blur-md"
                />
                <div className="absolute top-0 left-0 bg-white/20 w-full h-full backdrop-blur-lg" />
                <div className="absolute top-0 left-0 p-[16px]">
                  <img
                    src={llamaImage}
                    alt=""
                    className="discover-model-img w-[44px] h-[44px] rounded-md"
                  />
                  <h3 className="base-regular mt-[10px] mb-[3px]">DeepSeek</h3>
                  <p className="break-words line-clamp-2 base-regular">
                    lorem ipsum dolor sit amet consectetur adipiscing elit etiam
                    consectetur elementum mattis aliquam vulputate consectetur
                    etiam consectetur lorem ipsum dolor sit amet consectetur
                    adipiscing elit etiam consectetur elementum mattis aliquam
                    vulputate consectetur etiam consectetur lorem ipsum dolor
                    sit amet consectetur adipiscing elit etiam consectetur
                    elementum mattis aliquam vulputate consectetur etiam
                    consectetur lorem ipsum dolor sit amet consectetur
                    adipiscing elit etiam consectetur elementum mattis aliquam
                    vulputate consectetur etiam consectetur
                  </p>
                </div>
              </div>
            </Carousel>
          </div>

          <div className="w-full h-[158px] flex justify-between gap-3">
            <div className="min-w-[153.71px] md:w-[263.71px] h-full bg-[#D9D9D94D] rounded-md relative">
              <p className="absolute bottom-[-35px] right-[50%] translate-x-[50%]">
                App
              </p>
            </div>
            <div className="min-w-[153.71px] md:w-[263.71px] h-full bg-[#D9D9D94D] rounded-md relative">
              <p className="absolute bottom-[-35px] right-[50%] translate-x-[50%]">
                Models
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Carousel
            responsive={{
              desktop: {
                breakpoint: { max: 3000, min: 1024 },
                items: 1,
              },
              tablet: {
                breakpoint: { max: 1024, min: 464 },
                items: 1,
              },
            }}
            arrows={false}
            autoPlay
            showDots
            infinite
            className=""
            customDot={<CustomCarouselDot />}
            dotListClass="order-truffle-carousel-dots"
          >
            <div className="col-span-1 min-w-[263px] w-full h-[280px] lg:h-[353.19px] rounded-md overflow-hidden">
              <div className="flex flex-col w-full h-full">
                <div className="w-full h-full flex justify-center flex-1 bg-[#D9D9D94D]">
                  <img
                    src={truffleHardwareImage}
                    alt=""
                    className="self-end"
                  />
                </div>
                <div className="flex w-full h-[45%] border-t-[0.9px] border-t-white/30 radial-gradient from-[#d9d9d9]/50 from-[20%] via-[#d9d9d9]/45 via-30% to-[#D9D9D94D]/30 to-[60%]">
                  <Button
                    type="primary"
                    className="preorder-btn self-end m-[13px] h-[40px] w-full bg-[#817f7f] text-white"
                  >
                    <span className="base-medium ">Pre Order Truffle–1</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-span-1 min-w-[263px] w-full h-[280px] lg:h-[353.19px] rounded-md overflow-hidden">
              <div className="flex flex-col w-full h-full">
                <div className="w-full h-full flex justify-center flex-1 bg-[#D9D9D94D]">
                  <img
                    src={truffleHardwareImage}
                    alt=""
                    className="self-end"
                  />
                </div>
                <div className="flex w-full h-[45%] border-t-[0.9px] border-t-white/30 radial-gradient from-[#d9d9d9]/50 from-[20%] via-[#d9d9d9]/45 via-30% to-[#D9D9D94D]/30 to-[60%]">
                  <Button
                    type="primary"
                    className="preorder-btn self-end m-[13px] h-[40px] w-full bg-[#817f7f] text-white"
                  >
                    <span className="base-medium ">Pre Order Truffle–1</span>
                  </Button>
                </div>
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
