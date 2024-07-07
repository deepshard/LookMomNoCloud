import { useState } from "react";
import { useAppStore } from "../../store/store";
import { useHomePageContext } from "../../context/HomePageProvider";
import ModelCarousel from "../../component/ModelCarousel";
import Chat from "./Chat";
import Completion from "./Completion";
// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";
// @ts-ignore
import discoverVid from "../../assets/videos/discover-vid.mp4";
import { Input } from "antd";
import "./Playground.css";
// @ts-ignore
import plusIcon from "../../assets/icons/plus.svg";
// @ts-ignore
import sendIcon from "../../assets/icons/send-fill.svg";
// @ts-ignore
import dragOverIcon from "../../assets/icons/drag-over.svg";
import { usePlayground } from "./PlaygroundContext";

type PlaygroundProps = React.HTMLAttributes<HTMLDivElement>;

const Playground = ({ className = "", ...props }: PlaygroundProps) => {
  const { highlights, downloads } = useAppStore();
  const { setShowSearch, setShowDiscover } = useHomePageContext();
  const [mode, setMode] = useState<"chat" | "completions">("chat");
  const [isDragging, setIsDragging] = useState(false);
  const {model} = usePlayground();

  const handleDragOver = (e) => {
    e.preventDefault();

    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);
    // Handle file upload here
    const files = e.dataTransfer.files;
    console.log(files[0]);
  };

  if (Object.keys(downloads).length === 0) {
    return (
      <div className={`w-full h-full flex items-center flex-col backdrop-blur-[50px] px-[145px] pb-[17px] ${className}`} {...props}>
        <h1 className="heading-lg mt-[171px]">Welcome to LMNC™ Playground</h1>
        <p className="text-[16px] text-surface-500">Get started by downloading and running a model</p>
        <ModelCarousel models={highlights} className="mt-[60px] w-full flex-center" />
        <div
          className="flex-center gap-[6px] cursor-pointer bg-white/5 p-[8px] rounded-md mt-[62px]"
          onClick={() => {
            setShowDiscover(true);
            setShowSearch(true);
          }}>
          <video autoPlay loop muted className="aspect-square w-[18px] object-cover rounded-full saturate-0 brightness-125">
            <source src={discoverVid} type="video/mp4" />
          </video>

          <p className="text-sm text-surface-500">Discover More Models</p>
        </div>
        <div className="w-full rounded-md overflow-hidden bg-surface-100 p-2 flex mt-auto">
          <span className="h-8 flex-center">
            <img src={plusIcon} alt="" className="w-6 h-6" />
          </span>
          <Input.TextArea autoSize className="" placeholder="Chat with Llama-3..." />
          <span className="h-8 flex-center">
            <img src={sendIcon} alt="" className="w-6 h-6" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full h-full flex items-center flex-col backdrop-blur-[50px] px-[145px] pb-[17px] pt-[100px] ${className}`}
      {...props}>
      {isDragging && (
        <div className="w-full h-full absolute flex flex-col-reverse backdrop-blur-[50px]">
          <div className="drag-over-dash">
            <img src={dragOverIcon} alt="" />
            <p>Release your files</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center mb-[11px] w-full h-[16px]">
        <img src={truffleHardwareLandscapeIcon} alt="" className="w-[16px] h-[16px] mr-2" />
        <p className="text-md text-surface-500">LMNC™ Playground</p>
      </div>

      {/* Welcome Message */}
      <p className="text-[32px] text-white w-full">Hey, there! What’s new today?</p>

      {/* Configuration */}
      <div className="flex items-center w-full h-[30px] mb-5">
        <button className={`mr-2 text-sm text-surface-500 ${mode === "chat" ? "text-white" : ""}`} onClick={() => setMode("chat")}>
          Chat
        </button>
        <button className={`mr-2 text-sm text-surface-500 ${mode === "completions" ? "text-white" : ""}`} onClick={() => setMode("completions")}>
          Completions
        </button>
      </div>
      {mode === "chat" ? <Chat /> : <Completion model={model} />}
      {/* <div className="w-full rounded-md overflow-hidden bg-surface-100 p-2 flex items-end mt-auto">
          <span className="h-8 flex-center">
            <img src={plusIcon} alt="" className="w-6 h-6" />
          </span>
          <Input.TextArea autoSize className="" placeholder="Chat with Llama-3..." />
          <span className="h-8 flex-center">
            <img src={sendIcon} alt="" className="w-6 h-6" />
          </span>
        </div> */}
    </div>
  );
};

export default Playground;
