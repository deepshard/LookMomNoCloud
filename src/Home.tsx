import { ReactDOM, useState, useEffect, useLayoutEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import ModelWidget, { ModelWidgetState } from "./component/ModelWidget";
import useStore, { Command } from "./store";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { app } from "electron";

import { IModel, IModelServerInfo } from "./types";
import { Button } from "antd";
import CustomCarouselDot from "./component/CustomCarouselDot";
import { uniqBy } from "lodash";
import DiscoverButton from "./component/common/DiscoverButton";

const MODEL_LIST = [
  {
    id: "0",
    title: "Llama 7B",
    author: "Meta",
    size: 3000000000,
    downloads: 120,
    risks: "Risks: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    capabilities: "Capabilities:Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    intro: "Intro: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    hfLink: "https://huggingface.co/togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
    likes: 70,
  },
  {
    id: "1",
    title: "openai/gpt-3.5-turbo",
    author: "Openai",
    size: 3000000000,
    downloads: 120,
    risks: "Risks: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    capabilities: "Capabilities:Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    intro: "Intro: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    hfLink: "https://huggingface.co/togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
    likes: 70,
  },
  {
    id: "2",
    title: "Phi",
    author: "Microsoft",
    size: 3000000000,
    downloads: 120,
    risks: "Risks: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    capabilities: "Capabilities:Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    intro: "Intro: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    hfLink: "https://huggingface.co/togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
    likes: 70,
  },
  {
    id: "3",
    title: "BLX",
    author: "Databricks",
    size: 3000000000,
    downloads: 120,
    risks: "Risks: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    capabilities: "Capabilities:Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    intro: "Intro: Llama 3B is a detailed model designed by Meta. This model is designed to be fine-tuned for a wide range of natural language understanding and generation tasks.",
    hfLink: "https://huggingface.co/togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
    likes: 70,
  },
];

export default function Home() {
  const [modelInfo, setModelInfo] = useState<IModelServerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [modelResponse, setModelResponse] = useState<string | null>(null);
  const { downloadProgress } = useStore((state) => state);
  const sendCommand = useStore((state) => state.sendCommand);
  const modelsState = useStore((state) => state.modelsState);

  const llamaImage = process.env.NODE_ENV === "development" ? "/assets/images/llama1.png" : "../../renderer/main_window/assets/images/llama1.png";
  const truffleHardwareImage = process.env.NODE_ENV === "development" ? "/assets/icons/truffle-hardware.svg" : "../../renderer/main_window/assets/icons/truffle-hardware.svg";

  const getWidgetState = (model: IModel): ModelWidgetState => {
    const modelPathName = model.hfLink.split("/").slice(3).join("/");
    if (model.progress > 0 && model.progress < 100) {
      return "downloading";
    }
    return "not-downloaded";
  };

  function getMergedModels() {
    const launchModelMap = new Map<string, IModel>();

    // Create a map for quick lookup of launchModels by id
    MODEL_LIST.forEach((launchModel) => {
      launchModelMap.set(launchModel.title, launchModel);
    });

    // Merge models based on the id
    const mergedModels = Object.values(modelsState).map((launchModel) => {
      const model = launchModelMap.get(launchModel.name);
      return {
        ...launchModel,
        ...model,
      };
    });

    return uniqBy([...mergedModels, ...MODEL_LIST], "title");
  }

  // return (
  //   <div className="grid gap-4">
  //     {activeModels.map((model) => (
  //       <div key={model.id} className="bg-green-200">
  //         <div>{model.id}</div>
  //         <div>{model.name}</div>
  //         <div>progress: {model.progress}</div>
  //         <div>{model.status}</div>
  //       </div>
  //     ))}
  //     {inactiveModels.map((model) => (
  //       <div
  //         className="bg-red-200"
  //         key={model.id}
  //         onClick={() => {
  //           sendCommand(Command.LAUNCH_MODEL, {
  //             model_name: model.title,
  //           });
  //         }}
  //       >
  //         {model.title}
  //       </div>
  //     ))}
  //   </div>
  // );

  // return (
  //   <div className="bg-red-200">
  //     <button>LLAMA 7B</button>

  //     <br />
  //     <p>
  //       State: <span className="font-mono">INSTALLEDIn</span>
  //     </p>
  //     <div>
  //       Progress: <span className="font-mono">100%</span>
  //     </div>
  //   </div>
  // );

  return (
    <div className="snap-y snap-mandatory">
      <div className="home-layout">
        <h1 className="h1-semibold mb-2">Welcome, Peter</h1>
        <div className="flex gap-4">
          {getMergedModels().map((model) => (
            <ModelWidget
              model={model}
              key={model.id}
              widgetState={getWidgetState(model)}
              downloadModel={() => {
                sendCommand(Command.LAUNCH_MODEL, {
                  model_name: model.title,
                });
              }}
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
                  <img src={llamaImage} alt="" className="blurred-bg-img backdrop-blur-md" />
                  <div className="absolute top-0 left-0 bg-white/20 w-full h-full backdrop-blur-lg" />
                  <div className="absolute top-0 left-0 p-[16px]">
                    <img src={llamaImage} alt="" className="discover-model-img w-[44px] h-[44px] rounded-md" />
                    <h3 className="base-regular mt-[10px] mb-[3px]">DeepSeek</h3>
                    <p className="break-words line-clamp-2 base-regular">lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur</p>
                  </div>
                </div>
                <div className="w-full h-[158px] relative overflow-hidden ">
                  <img src={llamaImage} alt="" className="blurred-bg-img backdrop-blur-md" />
                  <div className="absolute top-0 left-0 bg-white/20 w-full h-full backdrop-blur-lg" />
                  <div className="absolute top-0 left-0 p-[16px]">
                    <img src={llamaImage} alt="" className="discover-model-img w-[44px] h-[44px] rounded-md" />
                    <h3 className="base-regular mt-[10px] mb-[3px]">DeepSeek</h3>
                    <p className="break-words line-clamp-2 base-regular">lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur</p>
                  </div>
                </div>
              </Carousel>
            </div>

            <div className="w-full h-[158px] flex justify-between gap-3">
              <div className="min-w-[153.71px] md:w-[263.71px] h-full bg-[#D9D9D94D] rounded-md relative">
                <div className="grid grid-cols-2 gap-[21px] w-full h-full p-5">
                  <div className="w-full h-full flex flex-col gap-[21px] items-end justify-center">
                    <div className="h-[38px] w-[38px] bg-[#dc5656] rounded-md"></div>
                    <div className="h-[38px] w-[38px] bg-[#D9D9D9] rounded-md"></div>
                  </div>
                  <div className="w-full h-full flex flex-col gap-[21px] items-start justify-center">
                    <div className="h-[38px] w-[38px] bg-[#D9D9D9] rounded-md"></div>
                    <div className="h-[38px] w-[38px] bg-[#457efb] rounded-md"></div>
                  </div>
                </div>
                <p className="absolute bottom-[-35px] right-[50%] translate-x-[50%]">App</p>
              </div>
              <div className="min-w-[153.71px] md:w-[263.71px] h-full bg-[#D9D9D94D] rounded-md relative">
                <div className="grid grid-cols-2 gap-[21px] w-full h-full p-5">
                  <div className="w-full h-full flex flex-col gap-[21px] items-end justify-center">
                    <div className="h-[38px] w-[38px] bg-[#dc5656] rounded-md"></div>
                    <div className="h-[38px] w-[38px] bg-[#D9D9D9] rounded-md"></div>
                  </div>
                  <div className="w-full h-full flex flex-col gap-[21px] items-start justify-center">
                    <div className="h-[38px] w-[38px] bg-[#D9D9D9] rounded-md"></div>
                    <div className="h-[38px] w-[38px] bg-[#457efb] rounded-md"></div>
                  </div>
                </div>
                <p className="absolute bottom-[-35px] right-[50%] translate-x-[50%]">Models</p>
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
              className="rounded-md overflow-hidden"
              customDot={<CustomCarouselDot />}
              dotListClass="order-truffle-carousel-dots"
            >
              <div className="col-span-1 min-w-[263px] w-full h-[280px] lg:h-[353.19px] ">
                <div className="flex flex-col w-full h-full">
                  <div className="w-full h-full flex justify-center flex-1 bg-[#D9D9D94D]">
                    <img src={truffleHardwareImage} alt="" className="self-end" />
                  </div>
                  <div className="flex w-full h-[45%] border-t-[0.9px] border-t-white/30 radial-gradient from-[#d9d9d9]/50 from-[20%] via-[#d9d9d9]/45 via-30% to-[#D9D9D94D]/30 to-[60%]">
                    <Button type="primary" className="preorder-btn self-end m-[13px] h-[40px] w-full bg-[#817f7f] text-white">
                      <span className="base-medium ">Pre Order Truffle–1</span>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-span-1 min-w-[263px] w-full h-[280px] lg:h-[353.19px]">
                <div className="flex flex-col w-full h-full">
                  <div className="w-full h-full flex justify-center flex-1 bg-[#D9D9D94D]">
                    <img src={truffleHardwareImage} alt="" className="self-end" />
                  </div>
                  <div className="flex w-full h-[45%] border-t-[0.9px] border-t-white/30 radial-gradient from-[#d9d9d9]/50 from-[20%] via-[#d9d9d9]/45 via-30% to-[#D9D9D94D]/30 to-[60%]">
                    <Button type="primary" className="preorder-btn self-end m-[13px] h-[40px] w-full bg-[#817f7f] text-white">
                      <span className="base-medium ">Pre Order Truffle–1</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Carousel>
          </div>
        </div>
      </div>

      <div className="w-screen h-screen absolute left-0 bottom-[-94vh] snap-start snap-always">
        <span className="cursor-pointer w-full flex-center sticky top-8 mb-4 z-10">
          <DiscoverButton />
        </span>
        <div className="w-full h-full relative">
          <div className="backdrop-blur-2xl bg-white/20 w-full h-full rounded-lg overflow-hidden "></div>
          <div className="absolute top-0 backdrop-blur-xl  w-full h-full rounded-lg overflow-hidden "></div>
          <div className="absolute top-0 backdrop-blur-xl  w-full h-full rounded-lg border-t-[0.9px] overflow-hidden "></div>
        </div>
      </div>
    </div>
  );
}
