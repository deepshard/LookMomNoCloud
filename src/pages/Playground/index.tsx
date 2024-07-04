import { useState } from "react";

// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";
import Chat from "./Chat";
import { TModel } from "../../types/schemas";

interface PlaygroundProps extends React.HTMLAttributes<HTMLDivElement> {

}

interface Settings {
  temperature: number;
  maximumLength: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  bestOf: number;
}

const Playground = ({ ...props}: PlaygroundProps) => {
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
  });
  const [mode, setMode] = useState<"chat" | "completions">("chat");
  const [settings, setSettings] = useState<Settings>({
    temperature: 1,
    maximumLength: 100,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    bestOf: 1,
  });

  return (
    <div className="playground">
      <div className="flex flex-col w-[660px] h-[533px]" {...props}>
        {/* Header */}
        <div className="flex items-center mb-[11px] w-full h-[16px]">
          <img src={truffleHardwareLandscapeIcon} alt="" className="w-[16px] h-[16px] mr-2" />
          <p className="text-md text-surface-500">LMNC™ Playground</p>
        </div>

        {/* Welcome Message */}
        <div className="flex items-center w-full h-[37px]">
          <p className="text-[32px] text-white">Hey, there! What’s new today?</p>
        </div>

        {/* Configuration */}
        <div className="flex items-center w-full h-[30px] mb-5">
          {/* TODO */}
        </div>

        {/* Interface */}
        {mode === "chat" ? (
          <Chat model={model} />
        ) : (
         <></> 
        )}
      </div>
    </div>
  )
}

export default Playground