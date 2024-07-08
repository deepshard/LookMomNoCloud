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
import { Input, Slider, ConfigProvider } from "antd";
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
import { PlaygroundProvider, usePlayground } from "./PlaygroundContext";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "../../Popup";
import { DrawerClose } from "./Drawer";

interface PlaygroundProps extends React.HTMLAttributes<HTMLDivElement> { }

const Playground = ({ className = "", ...props }: PlaygroundProps) => {
  const { highlights, downloads } = useAppStore();
  const { setShowSearch, setShowDiscover } = useHomePageContext();
  const [mode, setMode] = useState<"chat" | "completions">("chat");
  const [isDragging, setIsDragging] = useState(false);


  const handleDragOver = (e) => {
    e.preventDefault();

    setIsDragging(true);
    console.log("Drag over");
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    console.log("Drag leave");
  };

  const handleDrop = (e) => {
    e.preventDefault();

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
    <PlaygroundProvider>
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
          <DrawerClose className="ml-auto">Close</DrawerClose>
        </div>

        {/* Welcome Message */}
        <p className="text-[32px] text-white w-full">Hey, there! What’s new today?</p>


        {/* Configuration */}
        {/* <div className="flex items-center w-full h-[30px] mb-5">
          <button className={`mr-2 text-sm text-surface-500 ${mode === "chat" ? "text-white" : ""}`} onClick={() => setMode("chat")}>
            Chat
          </button>
          <button className={`mr-2 text-sm text-surface-500 ${mode === "completions" ? "text-white" : ""}`} onClick={() => setMode("completions")}>
            Completions
          </button>
        </div> */}

        <div className="flex self-start mt-5 gap-2">
          <ModelSwitcher />
          <ChatSettings />
        </div>

        {mode === "chat" ? (
          <Chat />
        ) : (
          <Completion></Completion>
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
    </PlaygroundProvider>
  );
};

function ModelSwitcher() {
  const { model, setModel } = usePlayground();
  const { data: myModels, isLoading: isLoadingMyModels } = useGetMyModels();
  const [showModelSelector, setShowModelSelector] = useState(false);

  if (isLoadingMyModels || !myModels) return null;

  let runningModels = myModels.filter((model) => model.status === "RUNNING");
  if (runningModels.length === 0) return <div className="bg-white/5 w-40 p-2 px-5 rounded-full">No models running</div>

  return (
    <Popover open={showModelSelector} onOpenChange={setShowModelSelector} modal>
      <PopoverTrigger>
        <div className="bg-white/5 h-10 p-1.5 pr-2.5 cursor-pointer flex items-center justify-between playground-popup">
          {model ? <div className="flex items-center gap-1">
            <img src={model.backgroundImage} className="w-[18px] h-[18px] rounded-full" />
            <div>
              <div>{model.title}</div>
            </div>
          </div> : "Select a model"}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="playground-popup p-2 mt-1">
          {runningModels.map((model) => (
            <div key={model.id} className="p-1 cursor-pointer flex items-center gap-2 hover:bg-white/5 rounded-xs" onClick={() => { setModel(model); setShowModelSelector(false); }}>
              <img src={model.backgroundImage} className="w-13 h-9 rounded-[5px]" />
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
      </PopoverContent>
    </Popover>

  )
}

function ChatSettings() {
  const { settings, setSettings } = usePlayground();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Popover open={showSettings} onOpenChange={setShowSettings} modal>
      <PopoverTrigger>
        <div className="bg-white/5 w-10 h-10 rounded-full cursor-pointer playground-popup flex items-center">
          <SettingsIcon height={14} width={14} className="mx-auto" />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <ConfigProvider
          theme={{
            token: {
              colorPrimaryBorderHover: "white",
            },
            components: {
              Slider: {
                handleColor: "white",
                trackBg: "white",
                railBg: "rgba(255, 255, 255, 0.2)",
                handleActiveColor: "transparent",
                trackHoverBg: "white",
                railHoverBg: "rgba(255, 255, 255, 0.2)",
              },
            },
          }}
        >
          <div className="playground-popup z-50 w-64 p-4  mt-1 right-0">
            <div className="mb-4">
              <label className="text-sm flex justify-between"><span className="text-surface-500">Creativity Level</span> <span className="text-white">{settings.temperature}</span></label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={settings.temperature}
                onChange={(value) => setSettings({ ...settings, temperature: value })}
              />
            </div>
            <div className="mb-4">
              <label className="text-sm flex justify-between"><span className="text-surface-500">Response Length</span> <span className="text-white">{settings.maxTokens}</span></label>
              <Slider
                min={1}
                max={2048}
                step={1}
                value={settings.maxTokens}
                onChange={(value) => setSettings({ ...settings, maxTokens: value })}
              />
            </div>
            <div className="mb-4">
              <label className="text-sm flex justify-between"><span className="text-surface-500">Diversity Level</span> <span className="text-white">{settings.topP}</span></label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={settings.topP}
                onChange={(value) => setSettings({ ...settings, topP: value })}
              />
            </div>
            <div className="mb-4">
              <label className="text-sm flex justify-between"><span className="text-surface-500">Repetition Control</span> <span className="text-white">{settings.frequencyPenalty}</span></label>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={settings.frequencyPenalty}
                onChange={(value) => setSettings({ ...settings, frequencyPenalty: value })}
              />
            </div>
            <div className="mb-4">
              <label className="text-sm flex justify-between"><span className="text-surface-500">Variety Boost</span> <span className="text-white">{settings.presencePenalty}</span></label>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={settings.presencePenalty}
                onChange={(value) => setSettings({ ...settings, presencePenalty: value })}
              />
            </div>
          </div>
        </ConfigProvider>
      </PopoverContent>
    </Popover>
  )

}

export default Playground;
