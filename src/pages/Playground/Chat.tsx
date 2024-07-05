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
import Tooltip from "../../component/common/Tooltip";
//@ts-ignore
import errorIcon from "../../assets/icons/error.svg";
import Dock from "./Dock";

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
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages, userMessage, images]);

  const addImage = (e: any) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      setImages([...images, e.target.result]);
    }
    reader.readAsDataURL(file);
  }

  const deleteImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  }

  const handleSetSystemMessage = (message: string) => {
    setSystemMessage(message);
  }

  const handleSendMessage = async (e: any) => {
    e.preventDefault();

    if (model.multimodal && images.length > 0) {
      setError("This model does not support multimodal inputs");
      return;
    }

    const message = e.target.value;
    if (message == "") return;

    setLoading(true);
    setUserMessage('');

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
      setImages([]);
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
        ...settings
      }),
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    setMessages([...newMessageSet, { "role": "assistant", "content": "" }]);

    let value;
    while (true) {
      ({ value } = await reader.read());
      
      const chunk = decoder.decode(value).substring(6).trim();
      if (chunk.includes("data: [DONE]") || chunk.includes("[DONE]")) {
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

  const getErrorContent = (errorMessage: string) => {
    return (
      <div className='w-full flex flex-col rounded-xs bg-white/20 backdrop-blur-3xl p-2.5 gap-2 justify-start items-stretch'>
        <div className='flex justify-start items-center gap-1.5 text-surface-main'>
          <img src={errorIcon} alt="errorIcon" className="h-3 text-error-regular" />

          <p>An Error Occurred</p>
        </div>

        {/* Divider */}
        <div className='w-full h-[0.5px] bg-surface-100' />

        <p className='body-xs text-surface-500 leading-snug'>{errorMessage}</p>
      </div>
    );
  }

  const getAddFileButton = () => {
    if (!model.multimodal) {
      return (
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
      );
    }

    return (
      <Tooltip
        overlayClassName="bg-black/20 rounded-sm backdrop-blur-2xl min-w-[200px]"
        overlayInnerStyle={{
          color: 'surface-500',
          padding: '5px',
          fontSize: '12px',
        }}
        placement="top"
        color="transparent"
        title="This model does not support multimodal inputs."
        
      >
        <Add height={12} width={12} className="mr-1 fill-surface-750 hover:fill-surface-500 hover:cursor-pointer" />
      </Tooltip>
    )
  }

  const getSubmitButton = () => {
    if (error) {
      return (
        <Tooltip
          overlayClassName="bg-black/20 rounded-sm backdrop-blur-2xl min-w-[200px]"
          overlayInnerStyle={{
            color: 'surface-500',
            padding: '5px',
            fontSize: '12px',
          }}
          placement="top"
          color="transparent"
          title={getErrorContent(error)}
          
        >
          <img src={errorIcon} alt="errorIcon" className="h-[17px] w-[17px]" />
        </Tooltip>
      );
    }

    if (loading) {
      return (
        <img src={installIcon} alt="chattingIcon" className="animate-spin flex-shrink-0" />
      );
    }

    return (
      <ArrowUp height={24} width={24} className="fill-surface-750 hover:fill-surface-500 hover:cursor-pointer" onClick={() => handleSendMessage(userMessage)} />
    );
  }

  return (
    <div className="flex flex-col justify-between w-full h-[447px]">
      {/* System Prompt */}
      <div className="flex flex-col items-start p-3 mb-5 w-[400px] h-[100px] bg-white/5 rounded-tr-sm rounded-bl-sm rounded-br-sm">
        <p className="text-surface-750 text-[16px] mb-1">System</p>
        <Input className="p-0 w-full h-[40px] bg-transparent border-none text-[16px] text-surface-750" placeholder="Enter system instructions..." value={systemMessage} onChange={(e) => handleSetSystemMessage(e.target.value)} />
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex flex-col items-start mb-5 w-full h-[350px] flex-grow overflow-y-scroll">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-center w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-center gap-2 p-2 w-[300px] bg-white/5 mb-4 break-words overflow-wrap-anywhere ${message.role === "user" ? "rounded-tl-sm rounded-tr-sm rounded-bl-sm" : "rounded-tl-sm rounded-tr-sm rounded-br-sm"}`}>
              <p className="text-surface-750 text-[16px]">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* File Display */}
      <Dock images={images} deleteImage={deleteImage} />

      {/* Chat Input */}
      <div className="flex items-center px-3 py-2 bg-white/10 w-full min-h-[40px] max-h-[150px] rounded-lg flex-shrink-0">
        <span className="h-8 flex-center">
          {getAddFileButton()}
        </span>
        <TextArea
          autoSize={{ minRows: 1, maxRows: 5 }}
          className="playground-chat-box max-h-[100px] align-middle"
          placeholder={`Chat with ${model.name}`}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onPressEnter={(e) => handleSendMessage(e)}
        />
        <span className="h-8 flex-center">
          {getSubmitButton()}
        </span>
      </div>
    </div>
  )
}

export default Chat;