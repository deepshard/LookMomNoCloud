import { useState } from "react";

// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";
import Chat from "./Chat";
import { TModel } from "../../types/schemas";
import { useAppStore } from "../../store/store";
import { useHomePageContext } from "../../context/HomePageProvider";
// @ts-ignore
import discoverVid from "../../assets/videos/discover-vid.mp4";
import ModelCarousel from "../../component/ModelCarousel";
import { Input } from "antd";
import "./Playground.css";
// @ts-ignore
import plusIcon from "../../assets/icons/plus.svg";
// @ts-ignore
import sendIcon from "../../assets/icons/send-fill.svg";
// @ts-ignore
import dragOverIcon from "../../assets/icons/drag-over.svg";
import Completion from "./Completion";

interface PlaygroundProps extends React.HTMLAttributes<HTMLDivElement> {}

interface Settings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const Playground = ({ className = "", ...props }: PlaygroundProps) => {
  const [model, setModel] = useState<TModel>({
    id: "1",
    name: "Test Model",
    title: "Test Model",
    size: 0,
    author: "Test Author",
    downloads: 0,
    likes: 0,
    intro: "Test Intro",
    capabilities: "Test Capabilities",
    risks: "Test Risks",
    hfLink: "https://huggingface.co",
    evalId: "1",
    createdAt: "2021-10-01",
    modifiedAt: "2021-10-01",
    status: "ACKNOWLEDGED",
    backgroundImage: "",
    lowresBackgroundImage: "",
    port: 8900,
    instance: 1,
    progress: 0,
    description: "Test Description",
    params: 0,
    error: "",
    multimodal: false
  });
  const [mode, setMode] = useState<"chat" | "completions">("completions");
  const [settings, setSettings] = useState<Settings>({
    temperature: 1,
    maxTokens: 100,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });

  // Chat data (so we can persist through mode changes)
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const { highlights, downloads } = useAppStore();
  const { setShowSearch, setShowDiscover } = useHomePageContext();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();

    if (!model.multimodal) return;

    setIsDragging(true);
  };

  const handleDragLeave = () => {
    if (!model.multimodal) return;

    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (!model.multimodal) return;

    setIsDragging(false);
    // Handle file upload here
    const files = e.dataTransfer.files;
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
        {mode === "chat" ? (
          <Chat
            model={model}
            settings={settings}
            systemMessage={systemMessage}
            messages={messages}
            userMessage={userMessage}
            images={images}
            setSystemMessage={setSystemMessage}
            setMessages={setMessages}
            setUserMessage={setUserMessage}
            setImages={setImages}
          />
        ) : (
          <Completion model={model}/>
        )}
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
