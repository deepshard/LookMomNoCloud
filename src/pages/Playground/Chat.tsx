import { useEffect, useRef, useState } from "react";
import { Input } from "antd";

// @ts-ignore
import arrowUpIcon from "../../assets/icons/arrow-up.svg";
import { TModel } from "../../types/schemas";
import { ChatMessage } from ".";
import ArrowUp from "../../icons/ArrowUp";
//@ts-ignore
import installIcon from "../../assets/icons/install.svg";

const { TextArea } = Input;

interface ChatProps {
  model: TModel;
  settings: any;
  systemMessage: string;
  messages: ChatMessage[];
  userMessage: string;
  setSystemMessage: (message: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setUserMessage: (message: string) => void;
}

const Chat = ({ model, settings, systemMessage, messages, userMessage, setSystemMessage, setMessages, setUserMessage }: ChatProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages]);

  const handleSetSystemMessage = (message: string) => {
    setSystemMessage(message);
  }

  const handleSendMessage = async (message: string) => {
    if (!message) return;

    setLoading(true);
    setUserMessage('');

    const newMessageSet: ChatMessage[] = [...messages, { "role": "user", "content": message }];
    setMessages(newMessageSet);

    // Send message to assistant
    const response = await fetch(`http://localhost:${model.port}/v1/chat/completions`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "messages": [{ "role": "system", "content": systemMessage }, ...newMessageSet],
        "max_tokens": 100,
        "stream": true,
      }),
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    setMessages([...newMessageSet, { "role": "assistant", "content": "" }]);

    let value;;
    while (true) {
      ({ value } = await reader.read());
      
      const chunk = decoder.decode(value).substring(6).trim();
      console.log(chunk);
      if (chunk.includes("data: [DONE]")) {
        break;
      }

      const data = JSON.parse(chunk);

      setMessages((prevMessages) => {
        const newMessageSet = [...prevMessages];
        newMessageSet[newMessageSet.length - 1].content += data["choices"][0]["delta"]["content"];
        return newMessageSet;
      });
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col justify-between w-full h-[573px]">
      {/* System Prompt */}
      <div className="flex flex-col items-start p-3 mb-5 w-[400px] h-[100px] bg-white/5 rounded-tr-sm rounded-bl-sm rounded-br-sm">
        <p className="text-surface-750 text-[16px] mb-1">System</p>
        <Input className="p-0 w-full h-[40px] bg-transparent border-none text-[16px] text-surface-750" placeholder="Enter system instructions..." value={systemMessage} onChange={(e) => handleSetSystemMessage(e.target.value)} />
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex flex-col items-start mb-5 w-full h-[307px] overflow-y-scroll">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-center w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-center gap-2 p-2 w-[300px] bg-white/5 mb-4 ${message.role === "user" ? "rounded-tl-sm rounded-tr-sm rounded-bl-sm" : "rounded-tl-sm rounded-tr-sm rounded-br-sm"}`}>
              <p className="text-surface-750 text-[16px] break-words overflow-wrap-anywhere">{message.content}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Chat Input */}
      <div className="flex items-center px-3 py-2 bg-white/10 w-full min-h-[40px] max-h-[100px] rounded-md">
        <TextArea
          autoSize
          className="p-0 w-full h-[40px] bg-transparent border-none text-surface-750 text-[16px]"
          placeholder={`Chat with ${model.name}`}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onPressEnter={(e) => handleSendMessage(e.target.value)}
        />
        {loading ? (
          <img src={installIcon} alt="chattingIcon" className="animate-spin" />
        ): (
          <ArrowUp height={24} width={24} className="fill-surface-750 hover:fill-surface-500 hover:cursor-pointer" onClick={() => handleSendMessage(userMessage)} />
        )}
      </div>
    </div>
  )
}

export default Chat;