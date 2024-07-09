import { createContext, useContext, useEffect, useState } from "react";
import { TModel } from "../../types/schemas";
import { ChatMessage, Image, Settings } from "./playgroundTypes";
import { useAppStore } from "../../store/store";

interface PlaygroundContextProps {
  model: TModel | null;
  setModel: (model: TModel | null) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  systemMessage: string;
  setSystemMessage: (message: string) => void;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  images: Image[];
  setImages: (images: Image[]) => void;
}

const PlaygroundContext = createContext<PlaygroundContextProps>({
  model: null,
  setModel: () => { },
  settings: {} as Settings,
  setSettings: () => { },
  systemMessage: "",
  setSystemMessage: () => { },
  messages: [],
  setMessages: () => { },
  images: [],
  setImages: () => { },
});

export const PlaygroundProvider = ({ children }) => {
  const {downloads} = useAppStore();
  const [model, setModel] = useState<TModel | null>(null);
  const [settings, setSettings] = useState<Settings>({
    temperature: 1,
    maxTokens: 100,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
        images,
        setImages,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  )
}

export const usePlayground = () => useContext(PlaygroundContext);
