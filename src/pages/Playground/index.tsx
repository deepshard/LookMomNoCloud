import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/store";
import { useHomePageContext } from "../../context/HomePageProvider";
import ModelCarousel from "../../component/ModelCarousel";
import Chat from "./Chat";
import Completion from "./Completion";
// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";
// @ts-ignore
import discoverVid from "../../assets/videos/discover-vid.mp4";
import { Input, Slider, ConfigProvider } from "antd";
import "./Playground.css";
// @ts-ignore
import plusIcon from "../../assets/icons/plus.svg";
// @ts-ignore
import sendIcon from "../../assets/icons/send-fill.svg";
// @ts-ignore
import accordionIcon from "../../assets/icons/accordion.svg";
// @ts-ignore
import closeIcon from "../../assets/icons/close.svg";
// @ts-ignore
import checkmark from "../../assets/icons/checkmark-circle-fill.svg";
import { usePlayground } from "./PlaygroundContext";
import { formatParams } from "../../utils/sysUtils";
import SettingsIcon from "../../icons/SettingsIcon";
import { Popover, PopoverContent, PopoverTrigger } from "../../Popup";
import { TModel } from "../../types/schemas";
import { DrawerClose } from "./Drawer";
import { upperFirst } from "lodash";
import ChatIcon from "../../icons/ChatIcon";

type PlaygroundProps = React.HTMLAttributes<HTMLDivElement>;

const Playground = ({ className = "", ...props }: PlaygroundProps) => {
  const { highlights, downloads } = useAppStore();
  const { setShowSearch, setShowDiscover } = useHomePageContext();
  const [mode, setMode] = useState<"chat" | "completions">("chat");
  const { model, settings } = usePlayground();
  const [showModeSelector, setShowModeSelector] = useState(false);

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
    <div className={`playground  ${className}`} {...props}>
      <div className="w-full h-full overflow-y-scroll px-[145px] pt-[100px] pb-[16px] hide-scrollbar flex flex-col">
        <div className="flex items-center mb-[11px] w-full">
          <img src={truffleHardwareLandscapeIcon} alt="" className="w-[16px] h-[16px] mr-2" />
          <p className="text-md text-surface-500">LMNC™ Playground</p>
          <DrawerClose className="ml-auto">
            <div className="flex absolute cursor-pointer h-[30px] w-[30px] bg-surface-main/5 rounded-full top-[20px] right-[20px] z-[9999] justify-center items-center text-surface-750">
              <img src={closeIcon} alt="" className="h-3 fill-surface-500" />
            </div>
          </DrawerClose>
        </div>
        <div className="flex self-start mt-5 mb-5 gap-2">
          <ModelSwitcher myModels={Object.values(downloads)} />
          <Popover open={showModeSelector} onOpenChange={setShowModeSelector} modal>
            <PopoverTrigger>
              <div className="cursor-pointer !min-w-6 playground-popup flex flex-center gap-1 p-1.5 pr-2.5 text-sm">
                <span className="bg-surface-main/5 rounded-full p-1">
                  <img src={chatBubble} alt="" />
                </span>
                {upperFirst(mode)}
                <img src={accordionIcon} alt="" className="w-[7px] h-[4px]" />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="playground-popup-content p-2 mt-1">
                {["chat", "completions"].map((m) => (
                  <div
                    key={m}
                    onClick={() => {
                      setMode(m as "chat" | "completions");
                      setShowModeSelector(false);
                    }}
                    className="rounded-[13px] p-2 cursor-pointer flex items-center gap-2 hover:bg-white/10">
                    {upperFirst(m)}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <ChatSettings model={model} />
        </div>
        {mode === "chat" ? <Chat /> : <Completion model={model} settings={settings} />}
      </div>
    </div>
  );
};

function ModelSwitcher({ myModels }: { myModels: TModel[] }) {
  const { model, setModel, setSystemMessage, setMessages } = usePlayground();
  const [showModelSelector, setShowModelSelector] = useState(false);

  const runningModels = myModels.filter((model) => model.status === "RUNNING");
  if (runningModels.length === 0) return <div className="flex flex-center bg-white/5 p-3 h-[36px] rounded-full">No models running</div>;

  return (
    <Popover open={showModelSelector} onOpenChange={setShowModelSelector} modal>
      <PopoverTrigger>
        <div className="playground-popup flex flex-center gap-2 p-1.5 pr-3 text-sm">
          {model ? (
            <>
              <img src={model.backgroundImage} className="w-6 h-6 rounded-full" />
              {model.title}
              <img src={accordionIcon} alt="" className="w-[7px] h-[4px]" />
            </>
          ) : (
            "Select a model"
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="playground-popup-content mt-1">
          {[...runningModels, ...runningModels].map((m) => (
            <div
              key={m.id}
              className="playground-popup-content-model"
              onClick={() => {
                setShowModelSelector(false);
                if (model?.id === m.id) return;
                setModel(m);
                setSystemMessage("");
                setMessages([]);
              }}>
              <img src={m.backgroundImage} className="w-[72px] h-12 rounded-[6px]" />
              <div className="flex flex-col gap-1 -mt-1">
                <p className="text-surface-750 title-sm  h-3.5 leading-tight">{m.name}</p>
                <p className="text-surface-500 text-xs h-3.5 leading-normal">{`${m.author} • ${formatParams(m.size)}`}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ChatSettings({ model }: { model: TModel | null }) {
  const maxTokens = model ? Math.trunc((0.85 * model?.contextLength) / 2) : 0; // 0.85 provides a buffer for template tokens
  const { settings, setSettings } = usePlayground();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Popover open={showSettings} onOpenChange={setShowSettings} modal>
      <PopoverTrigger>
        <div className="bg-white/5 w-[36px] h-[36px] rounded-full cursor-pointer playground-popup flex items-center">
          <SettingsIcon height={18} width={18} className="mx-auto" />
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
          }}>
          <div className="playground-popup-content  w-64 p-4  mt-1 right-0">
            <div className="mb-3 text-sm">
              <label className="text-surface-500">Settings</label>
            </div>

            <div className='w-full h-[0.5px] bg-surface-100 mb-3' />

            <div className="mb-4">
              <label className="text-sm flex justify-between">
                <span className="text-surface-500">Temperature:</span> <span className="text-white">{settings.temperature}</span>
              </label>
              <Slider min={0} max={1} step={0.1} value={settings.temperature} onChange={(value) => setSettings({ ...settings, temperature: value })} />
            </div>
            <div className="mb-4">
              <label className="text-sm flex justify-between">
                <span className="text-surface-500">Max Tokens:</span> <span className="text-white">{settings.maxTokens}</span>
              </label>
              <Slider min={1} max={maxTokens} step={1} value={settings.maxTokens} onChange={(value) => setSettings({ ...settings, maxTokens: value })} />
            </div>
            <div className="mb-4">
              <label className="text-sm flex justify-between">
                <span className="text-surface-500">Top P:</span> <span className="text-white">{settings.topP}</span>
              </label>
              <Slider min={0} max={1} step={0.1} value={settings.topP} onChange={(value) => setSettings({ ...settings, topP: value })} />
            </div>
            <div className="mb-4">
              <label className="text-sm flex justify-between">
                <span className="text-surface-500">Frequency Penalty:</span> <span className="text-white">{settings.frequencyPenalty}</span>
              </label>
              <Slider min={0} max={2} step={0.1} value={settings.frequencyPenalty} onChange={(value) => setSettings({ ...settings, frequencyPenalty: value })} />
            </div>
            <div>
              <label className="text-sm flex justify-between">
                <span className="text-surface-500">Presence Penalty:</span> <span className="text-white">{settings.presencePenalty}</span>
              </label>
              <Slider min={0} max={2} step={0.1} value={settings.presencePenalty} onChange={(value) => setSettings({ ...settings, presencePenalty: value })} />
            </div>
          </div>
        </ConfigProvider>
      </PopoverContent>
    </Popover>
  );
}

export default Playground;
