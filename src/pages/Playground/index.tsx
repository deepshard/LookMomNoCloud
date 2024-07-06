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
import { Input, Slider } from "antd";
import "./Playground.css";
// @ts-ignore
import plusIcon from "../../assets/icons/plus.svg";
// @ts-ignore
import sendIcon from "../../assets/icons/send-fill.svg";
// @ts-ignore
import dragOverIcon from "../../assets/icons/drag-over.svg";
import { useGetMyModels } from "../../lib/react-query/queriesAndMutations";
import { formatParams } from "../../utils/sysUtils";
import ArrowDown from "../../icons/ArrowDown";
import ArrowUp from "../../icons/ArrowUp";
import SettingsIcon from "../../icons/SettingsIcon";
import Completion from "./Completion";

interface PlaygroundProps extends React.HTMLAttributes<HTMLDivElement> { }

interface Settings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface Image {
  id: string;
  url: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | { type: string; text?: string; image_url?: { url: string } }[];
}

const Playground = ({ className = "", ...props }: PlaygroundProps) => {
  const [model, setModel] = useState<TModel>();
  const [mode, setMode] = useState<"chat" | "completions">("chat");
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
  const [images, setImages] = useState<Image[]>([]);
  const { highlights, downloads } = useAppStore();
  const { setShowSearch, setShowDiscover } = useHomePageContext();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();

    if (!model.multimodal) return;

    setIsDragging(true);
    console.log("Drag over");
  };

  const handleDragLeave = () => {
    if (!model.multimodal) return;

    setIsDragging(false);
    console.log("Drag leave");
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (!model.multimodal) return;

    setIsDragging(false);
    // Handle file upload here
    const files = e.dataTransfer.files;
    console.log("Dropped files:", files);
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

      <div className="flex">
        <ModelSwitcher setModel={setModel} model={model} />
        <ChatSettings settings={settings} setSettings={setSettings} />
      </div>
      <Completion></Completion>
      {/* {
        mode === "chat" ? (
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
        )
      } */}
      {/* <div className="w-full rounded-md overflow-hidden bg-surface-100 p-2 flex items-end mt-auto">
        <span className="h-8 flex-center">
          <img src={plusIcon} alt="" className="w-6 h-6" />
        </span>
        <Input.TextArea autoSize className="" placeholder="Chat with Llama-3..." />
        <span className="h-8 flex-center">
          <img src={sendIcon} alt="" className="w-6 h-6" />
        </span>
      </div> */}
    </div >
  );
};

function ModelSwitcher({ setModel, model }: { setModel: (model: TModel) => void, model: TModel | undefined }) {
  const { data: myModels, isLoading: isLoadingMyModels } = useGetMyModels();
  const [showModelSelector, setShowModelSelector] = useState(false);

  if (isLoadingMyModels || !myModels) return null;

  let runningModels = myModels.filter((model) => model.status === "RUNNING");
  if (runningModels.length === 0) return <div className="bg-white/5 w-40 p-2 px-5 rounded-full">No models running</div>

  return (
    <div className="relative z-50">
      <div className="bg-white/5 w-40 p-2 px-5 rounded-full cursor-pointer flex items-center justify-between" onClick={() => setShowModelSelector(!showModelSelector)}>
        {model ? <div className="flex items-center gap-2">
          <img src={model.backgroundImage} className="w-7 h-7 rounded-full" />
          <div>
            <div>{model.title}</div>
          </div>
        </div> : "Select a model"}
        {showModelSelector ? <ArrowUp height={12} width={12} /> : <ArrowDown height={12} width={12} />}
      </div>
      {showModelSelector && (
        <div className="absolute bg-white/10 w-96 p-2 rounded-md mt-1">
          {runningModels.map((model) => (
            <div key={model.id} className="p-2 cursor-pointer flex items-center gap-2" onClick={() => { setModel(model); setShowModelSelector(false); }}>
              <img src={model.backgroundImage} className="w-7 h-7 rounded-full" />
              <div className="flex flex-col gap-1 -mt-1">
                <p className="text-surface-750 title-sm h-3.5 leading-tight">
                  {model.name}
                </p>
                <p className="text-surface-500 text-xs h-3.5 leading-normal">
                  {`${model.author} • ${formatParams(model.size)}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatSettings({ settings, setSettings }: { settings: Settings, setSettings: (settings: Settings) => void }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative ml-4 z-50">
      <div
        className="bg-white/5 p-2 px-4 rounded-full cursor-pointer flex items-center"
        onClick={() => setShowSettings(!showSettings)}
      >
        <SettingsIcon height={12} width={12} />
      </div>
      {showSettings && (
        <div className="absolute bg-white/10 w-64 p-4 rounded-md mt-1 right-0">
          <div className="mb-4">
            <label className="text-sm text-surface-500">Temperature: {settings.temperature}</label>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={settings.temperature}
              onChange={(value) => setSettings({ ...settings, temperature: value })}
            />
          </div>
          <div className="mb-4">
            <label className="text-sm text-surface-500">Max Tokens: {settings.maxTokens}</label>
            <Slider
              min={1}
              max={2048}
              step={1}
              value={settings.maxTokens}
              onChange={(value) => setSettings({ ...settings, maxTokens: value })}
            />
          </div>
          <div className="mb-4">
            <label className="text-sm text-surface-500">Top P: {settings.topP}</label>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={settings.topP}
              onChange={(value) => setSettings({ ...settings, topP: value })}
            />
          </div>
          <div className="mb-4">
            <label className="text-sm text-surface-500">Frequency Penalty: {settings.frequencyPenalty}</label>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={settings.frequencyPenalty}
              onChange={(value) => setSettings({ ...settings, frequencyPenalty: value })}
            />
          </div>
          <div className="mb-4">
            <label className="text-sm text-surface-500">Presence Penalty: {settings.presencePenalty}</label>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={settings.presencePenalty}
              onChange={(value) => setSettings({ ...settings, presencePenalty: value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Playground;
