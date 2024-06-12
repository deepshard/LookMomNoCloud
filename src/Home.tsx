import { useState } from "react";
import ModelWidget, { ModelWidgetState } from "./component/ModelWidget";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import { Button } from "antd";
import CustomCarouselDot from "./component/CustomCarouselDot";
import { uniqBy } from "lodash";
import DiscoverButton from "./component/common/DiscoverButton";
import SysInfo from "./component/SysInfo";
import dottedBg from "../public/assets/images/clear-dotted-bg.png";

const MODEL_LIST = [
  {
    id: "0",
    title: "Llama 7B",
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
    title: "openai/gpt-3.5-turbo",
    author: "Openai",
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
    title: "Phi",
    author: "Microsoft",
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
    title: "BLX",
    author: "Databricks",
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
  const llamaImage =
    process.env.NODE_ENV === "development"
      ? "/assets/images/llama1.png"
      : "../../renderer/main_window/assets/images/llama1.png";
  const truffleHardwareImage =
    process.env.NODE_ENV === "development"
      ? "/assets/icons/truffle-hardware.svg"
      : "../../renderer/main_window/assets/icons/truffle-hardware.svg";

  const getWidgetState = (model: any): ModelWidgetState => {
    const modelPathName = model.hfLink.split("/").slice(3).join("/");
    return "not-downloaded";
  };

  return (
    <div className="snap-y snap-mandatory">
      <div className="home-layout w-full h-full flex flex-col justify-between items-center gap-5 p-14">
        <img src={dottedBg} alt="" className="w-full h-full absolute top-0 left-0 object-cover opacity-[15%]" />

        {/* DON'T DELETE – Meant for alignment purposes */}
        <div/>
        
        {/* HOME WIDGETS */}
        <div className="no-select w-[660px] flex flex-col justify-start items-center gap-5">
          
          <div className="flex w-full -mb-[3px] gap-1.5 justify-start items-center">
            {/* Should be <SunIcon /> */}
            <div className="h-4 w-4 rounded-full bg-surface-750" />
            
            {/* TITLE */}
            <h1 className="text-surface-750 w-full">Welcome, Peter</h1>
          </div>
          
          {/* FREQUENTLY USED WIDGETS */}
          <div className="flex gap-1.5 w-[660px]">
            {MODEL_LIST.map((model) => (
              <ModelWidget
                model={model}
                key={model.id}
                widgetState={getWidgetState(model)}
                downloadModel={() => {
                  return null;
                }}
              />
            ))}
          </div>

          {/* FIXED WIDGETS – News, Apps, Models & Hardware */}
          <div className="grid grid-cols-2 gap-5 lg:gap-5 w-auto max-w-[660px] items-center justify-center">
            {/* New Explore and Apps container */}
            <div className="col-span-1 flex flex-col gap-5 justify-between w-80">
              
              {/* NEWS CAROUSEL */}
              <div className="relative widget-3d rounded-lg w-80 h-[150px]">
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
                  className="rounded-lg"
                  customDot={<CustomCarouselDot />}
                  dotListClass="discover-carousel-dots"
                >
                  {/* 1 */}
                  <div className="w-full h-[150px] relative overflow-hidden ">
                    <div className="absolute top-0 left-0 p-5">
                      <img
                        src={llamaImage}
                        alt=""
                        className="discover-model-img w-10 h-10 rounded-xs"
                      />
                      <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main">
                        DeepSeek
                      </h3>
                      <p className="body-sm break-words line-clamp-2 base-regular text-surface-500">
                        lorem ipsum dolor sit amet consectetur adipiscing elit
                        etiam consectetur elementum mattis aliquam vulputate
                        consectetur etiam consectetur lorem ipsum dolor sit amet
                        consectetur adipiscing elit etiam consectetur elementum
                        mattis aliquam vulputate consectetur etiam consectetur
                        lorem ipsum dolor sit amet consectetur adipiscing elit
                        etiam consectetur elementum mattis aliquam vulputate
                        consectetur etiam consectetur lorem ipsum dolor sit amet
                        consectetur adipiscing elit etiam consectetur elementum
                        mattis aliquam vulputate consectetur etiam consectetur
                      </p>
                    </div>
                  </div>

                  {/* 2 */}
                  <div className="w-full h-[150px] relative overflow-hidden ">
                    <div className="absolute top-0 left-0 p-5">
                      <img
                        src={llamaImage}
                        alt=""
                        className="discover-model-img w-10 h-10 rounded-xs"
                      />
                      <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main">
                        DeepSeek
                      </h3>
                      <p className="body-sm break-words line-clamp-2 base-regular text-surface-500">
                        lorem ipsum dolor sit amet consectetur adipiscing elit
                        etiam consectetur elementum mattis aliquam vulputate
                        consectetur etiam consectetur lorem ipsum dolor sit amet
                        consectetur adipiscing elit etiam consectetur elementum
                        mattis aliquam vulputate consectetur etiam consectetur
                        lorem ipsum dolor sit amet consectetur adipiscing elit
                        etiam consectetur elementum mattis aliquam vulputate
                        consectetur etiam consectetur lorem ipsum dolor sit amet
                        consectetur adipiscing elit etiam consectetur elementum
                        mattis aliquam vulputate consectetur etiam consectetur
                      </p>
                    </div>
                  </div>
                </Carousel>
              </div>

              {/* APPS AND MODELS FOLDERS */}
              <div className="w-full flex justify-between gap-5">
                {/* APPS FOLDER */}
                <div className="flex justify-center items-center min-w-[150px] md:w-[150px] min-h-[150px] widget-3d rounded-lg relative">
                  <div className="grid grid-cols-2 gap-5 p-5">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="bg-surface-100 h-[38px] w-[38px] rounded-xs"></div>
                    ))}
                  </div>
                  <p className="callout-regular text-surface-400 absolute bottom-[-35px] right-[50%] translate-x-[50%]">
                    Apps
                  </p>
                </div>

                {/* MODELS FOLDER */}
                <div className="flex justify-center items-center min-w-[150px] md:w-[150px] min-h-[150px] widget-3d rounded-lg relative">
                  <div className="grid grid-cols-2 gap-5 p-5">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="bg-surface-100 h-[38px] w-[38px] rounded-xs"></div>
                    ))}
                  </div>
                  <p className="callout-regular text-surface-400 absolute bottom-[-35px] right-[50%] translate-x-[50%]">
                    Models
                  </p>
                </div>
              </div>
            </div>

            {/* HARDWARE MWIDGET – CAROUSEL */}
            <div className="relative overflow-hidden widget-3d w-80 h-80">
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
                // autoPlay
                showDots
                infinite
                className="w-full h-full items-center"
                customDot={<CustomCarouselDot />}
                dotListClass="order-truffle-carousel-dots"
              >
                {/* System Info */}
                <div className="w-full h-full">
                  <SysInfo />
                </div>

                {/* Truffle Hardware Slide */}
                <div className="col-span-1 w-full h-full ">
                  <div className="flex flex-col w-full h-full">
                    <div className="w-full h-full flex justify-center flex-1 ">
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

        {/* DON'T DELETE – Meant for alignment purposes */}
        <div/>
      </div>

    </div>
  );
}
