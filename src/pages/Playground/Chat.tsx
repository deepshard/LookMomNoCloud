import { useEffect, useRef, useState } from "react";
import { Form, Input } from "antd";
import Tooltip from "../../component/common/Tooltip";
import Dock from "./Dock";
import { Image, ChatMessage } from "./playgroundTypes";
import ArrowUp from "../../icons/ArrowUp";
import Add from "../../icons/Add";

//@ts-ignore
import installIcon from "../../assets/icons/install.svg";
//@ts-ignore
import errorIcon from "../../assets/icons/error.svg";
import { usePlayground } from "./PlaygroundContext";
// @ts-ignore
import dragOverIcon from "../../assets/icons/drag-over.svg";

import "./Playground.css";

const { TextArea } = Input;

const Chat = () => {
  const { model, settings, systemMessage, setSystemMessage, messages, setMessages, images, setImages } = usePlayground();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages, images]);

  const addImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        id: crypto.randomUUID().toString(),
        url: e.target?.result as string,
      };
      setImages([...images, newImage]);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const deleteImage = (id: string) => {
    setImages(images.filter((image) => image.id !== id));
  };

  const createNewUserMessage = (message: string, images: Image[]): ChatMessage => {
    if (images.length == 0) {
      return { role: "user", content: message };
    }

    return {
      role: "user",
      content: [{ type: "text", text: message }, ...images.map((image) => ({ type: "image_url", image_url: { url: image.url } }))],
    };
  };

  const updateAssistantMessage = (data: any) => {
    //@ts-ignore
    setMessages((prevMessages) => {
      const newMessageSet = [...prevMessages];
      const lastMessage = newMessageSet[newMessageSet.length - 1];
      if (typeof lastMessage.content === "string") {
        lastMessage.content += data.choices[0].delta.content || "";
      }
      return newMessageSet;
    });
  };

  const sendMessageToAssistant = async (messageSet: ChatMessage[]) => {
    try {
      if (!model) {
        return;
      }
      const response = await fetch(`http://localhost:${model.port}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: systemMessage }, ...messageSet],
          stream: true,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          top_p: settings.topP,
          frequency_penalty: settings.frequencyPenalty,
          presence_penalty: settings.presencePenalty,
        }),
      });

      if (!response.ok) {
        setError("An error occurred while sending the message to the assistant.");
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      setMessages([...messageSet, { role: "assistant", content: "" }]);

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value).substring(6).trim();
        // Check if the message is done, sometimes the message is not wrapped in JSON or flagged as done
        if (chunk.includes("data: [DONE]") || chunk.includes("[DONE]")) break;

        try {
          const data = JSON.parse(chunk);
          updateAssistantMessage(data);
        } catch (error) {
          console.error("Error parsing chunk:", error);
        }
      }
    } catch (error) {
      setError("An error occurred while sending the message to the assistant.");
    }
  };

  const onFinish = async (values: any) => {
    values.userMessage = values?.userMessage?.trim();
    // e.preventDefault();

    if (!model?.multimodal && images.length > 0) {
      setError("This model does not support multimodal inputs");
      return;
    }

    const message = values.userMessage;
    if (!message) return;

    setLoading(true);
    form.setFieldValue("userMessage", "");

    const newMessage: ChatMessage = createNewUserMessage(message, images);
    if (images.length > 0) setImages([]);

    const newMessageSet: ChatMessage[] = [...messages, newMessage];
    setMessages(newMessageSet);

    try {
      await sendMessageToAssistant(newMessageSet);
    } catch (error) {
      setError("Failed to send message to assistant");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.submit();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();

    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);
    // Handle file upload here
    addImage(e);
  };

  const getErrorContent = (errorMessage: string) => {
    return (
      <div className="w-full flex flex-col rounded-xs bg-white/20 backdrop-blur-3xl p-2.5 gap-2 justify-start items-stretch">
        <div className="flex justify-start items-center gap-1.5 text-surface-main">
          <img src={errorIcon} alt="errorIcon" className="h-3 text-error-regular" />

          <p>An Error Occurred</p>
        </div>

        {/* Divider */}
        <div className="w-full h-[0.5px] bg-surface-100" />

        <p className="body-xs text-surface-500 leading-snug">{errorMessage}</p>
      </div>
    );
  };

  const getAddFileButton = () => {
    if (model?.multimodal) {
      return (
        <div>
          <input type="file" ref={fileInputRef} onChange={addImage} style={{ display: "none" }} accept=".png,.jpg,.jpeg" />
          <Add height={12} width={12} className="mr-1 fill-surface-750 hover:fill-surface-500 hover:cursor-pointer" onClick={() => fileInputRef.current?.click()} />
        </div>
      );
    }

    return null;
  };

  const getSubmitButton = () => {
    if (error) {
      return (
        <Tooltip
          overlayClassName="bg-black/20 rounded-sm backdrop-blur-2xl min-w-[200px]"
          overlayInnerStyle={{
            color: "surface-500",
            padding: "5px",
            fontSize: "12px",
          }}
          placement="top"
          color="transparent"
          title={getErrorContent(error)}>
          <img src={errorIcon} alt="errorIcon" className="h-[17px] w-[17px]" />
        </Tooltip>
      );
    }

    if (loading) {
      return <img src={installIcon} alt="generating" className="animate-spin" />;
    }

    return <ArrowUp height={24} width={24} className="fill-surface-750 hover:fill-surface-500 hover:cursor-pointer" onClick={() => onFinish(form.getFieldsValue())} />;
  };

  const getMessageContent = (message: ChatMessage) => {
    const isUser = message.role === "user";
    const containerClasses = `flex items-center w-full ${isUser ? "justify-end" : "justify-start"}`;
    const messageClasses = `flex items-start gap-2 p-2 max-w-[300px] bg-white/5 mb-4 break-words ${isUser ? "rounded-tl-sm rounded-tr-sm rounded-bl-sm" : "rounded-tl-sm rounded-tr-sm rounded-br-sm"}`;

    if (typeof message.content === "string") {
      return (
        <div className={containerClasses}>
          <div className={messageClasses}>
            <p className="text-surface-750 text-[16px] break-words">{message.content}</p>
          </div>
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <div className={`${messageClasses} flex-col items-start`}>
          {message.content[1].image_url && <img src={message.content[1].image_url.url} alt="user upload" className="w-[50px] h-[50px] object-cover rounded-xs shadow-md" />}
          <p className="text-surface-750 text-[16px]">{message.content[0].text}</p>
        </div>
      </div>
    );
  };

  return (
    <Form form={form} onFinish={onFinish} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="w-full h-full">
      {isDragging && (
        <div className="drag-over-container">
          <div className="drag-over-dash">
            <img src={dragOverIcon} alt="" />
            <p>Release your files</p>
          </div>
        </div>
      )}

      {/* System Prompt */}
      <div className="flex flex-col items-start p-5 mb-3 w-[400px] h-[100px] bg-white/5 rounded-tr-sm rounded-bl-sm rounded-br-sm">
        <p className="text-surface-750 text-[16px] mb-1">System</p>
        <Input
          className="p-0 w-full h-[40px] bg-transparent border-none text-[16px] text-surface-750"
          placeholder="Enter system instructions..."
          value={systemMessage} onChange={(e) => setSystemMessage(e.target.value)}
        />
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex flex-col items-start pb-5 w-full h-[68%] overflow-auto ">
        {messages.map((message, index) => (
          <div key={index} className="w-full">
            {getMessageContent(message)}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="absolute bottom-[16px] left-0 right-0 w-full px-[145px]">
        {/* File Display */}
        <Dock images={images} deleteImage={deleteImage} />
        <div className="flex items-center px-3 py-2 bg-white/10 w-full min-h-[40px] max-h-[150px] rounded-sm ">
          <span className="h-8 flex-center">{getAddFileButton()}</span>
          <Form.Item name="userMessage" noStyle>
            <TextArea
              autoFocus
              autoSize={{ minRows: 1, maxRows: 5 }}
              className="playground-chat-box max-h-[100px] align-middle"
              placeholder={`Chat with ${model?.name}`}
              value={form.getFieldValue("userMessage")}
              onKeyDown={handleSubmit}
            />
          </Form.Item>
          <span className="h-8 flex-center mr-1">{getSubmitButton()}</span>
        </div>
      </div>
    </Form>
  );
};

export default Chat;
