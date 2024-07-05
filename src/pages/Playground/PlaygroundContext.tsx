import { createContext, useContext, useState } from "react";
import { TModel } from "../../types/schemas";
import { ChatMessage, Image, Settings } from "./playgroundTypes";

interface PlaygroundContextProps {
  model: TModel;
  setModel: (model: TModel) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  systemMessage: string;
  setSystemMessage: (message: string) => void;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  userMessage: string;
  setUserMessage: (message: string) => void;
  images: Image[];
  setImages: (images: Image[]) => void;
}

const PlaygroundContext = createContext<PlaygroundContextProps>({
  model: {} as TModel,
  setModel: () => {},
  settings: {} as Settings,
  setSettings: () => {},
  systemMessage: "",
  setSystemMessage: () => {},
  messages: [],
  setMessages: () => {},
  userMessage: "",
  setUserMessage: () => {},
  images: [],
  setImages: () => {},
});

export const PlaygroundProvider = ({ children }) => {
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
    multimodal: true
  });
  const [settings, setSettings] = useState<Settings>({
    temperature: 1,
    maxTokens: 100,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState<string>("");
  const [images, setImages] = useState<Image[]>([]);

  return (
    <PlaygroundContext.Provider
      value={{
        model,
        setModel,
        settings,
        setSettings,
        systemMessage,
        setSystemMessage,
        messages,
        setMessages,
        userMessage,
        setUserMessage,
        images,
        setImages,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  )
}

export const usePlayground = () => useContext(PlaygroundContext);
