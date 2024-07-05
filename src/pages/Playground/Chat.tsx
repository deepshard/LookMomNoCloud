import { useEffect, useRef, useState } from "react";
import { Input } from "antd";

// @ts-ignore
import arrowUpIcon from "../../assets/icons/arrow-up.svg";
import { TModel } from "../../types/schemas";
import { ChatMessage } from ".";
import ArrowUp from "../../icons/ArrowUp";
//@ts-ignore
import installIcon from "../../assets/icons/install.svg";
import Add from "../../icons/Add";

const { TextArea } = Input;

interface ChatProps {
  model: TModel;
  settings: any;
  systemMessage: string;
  messages: ChatMessage[];
  userMessage: string;
  images: string[];
  setSystemMessage: (message: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setUserMessage: (message: string) => void;
  setImages: (image: string[]) => void;
}

const Chat = ({ model, settings, systemMessage, messages, userMessage, images, setSystemMessage, setMessages, setUserMessage, setImages }: ChatProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages]);

  const addImage = (e: any) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      setImages([...images, e.target.result]);
    }
    reader.readAsDataURL(file);
  }

  const handleSetSystemMessage = (message: string) => {
    setSystemMessage(message);
  }

  const handleSendMessage = async (e: any) => {
    e.preventDefault();

    setLoading(true);
    setUserMessage('');

    const message = e.target.value;
    if (!message) return;

    let newMessage;
    if (images.length == 0) {
      newMessage = { "role": "user", "content": message };
    } else {
      newMessage = {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": userMessage
          },
          images.map((image) => {
            return {
              "type": "image_url",
              "image_url": {
                "url": image
              }
            }
          })
        ]
      };
    }

    const newMessageSet: ChatMessage[] = [...messages, newMessage];
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
        settings
      }),
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    setMessages([...newMessageSet, { "role": "assistant", "content": "" }]);

    let value;
    while (true) {
      ({ value } = await reader.read());
      
      const chunk = decoder.decode(value).substring(6).trim();
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
      <div className="flex flex-col items-start p-3 mb-5 w-[400px] min-h-[100px] bg-white/5 rounded-tr-sm rounded-bl-sm rounded-br-sm">
        <p className="text-surface-750 text-[16px] mb-1">System</p>
        <Input className="p-0 w-full h-[40px] bg-transparent border-none text-[16px] text-surface-750" placeholder="Enter system instructions..." value={systemMessage} onChange={(e) => handleSetSystemMessage(e.target.value)} />
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex flex-col items-start mb-5 w-full h-[307px] flex-grow overflow-y-scroll">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-center w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-center gap-2 p-2 w-[300px] bg-white/5 mb-4 break-words overflow-wrap-anywhere ${message.role === "user" ? "rounded-tl-sm rounded-tr-sm rounded-bl-sm" : "rounded-tl-sm rounded-tr-sm rounded-br-sm"}`}>
              <p className="text-surface-750 text-[16px]">{message.content}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Chat Input */}
      <div className="flex items-center px-3 py-2 bg-white/10 w-full min-h-[40px] max-h-[150px] rounded-md flex-shrink-0 overflow-y-auto">
        <div className="flex items-center w-full">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={addImage}
              style={{ display: 'none' }}
              accept=".png,.jpg,.jpeg"
            />
            <Add height={12} width={12} className="mr-1 fill-surface-750 hover:fill-surface-500 hover:cursor-pointer" onClick={() => fileInputRef.current.click()} />
          </div>
          <TextArea
            autoSize={{ minRows: 1, maxRows: 5 }}
            className="p-1 w-full bg-transparent border-none text-surface-750 text-[16px] flex-grow"
            placeholder={`Chat with ${model.name}`}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onPressEnter={(e) => handleSendMessage(e)}
          />
          {loading ? (
            <img src={installIcon} alt="chattingIcon" className="animate-spin flex-shrink-0" />
          ): (
            <ArrowUp height={24} width={24} className="fill-surface-750 hover:fill-surface-500 hover:cursor-pointer" onClick={() => handleSendMessage(userMessage)} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat;