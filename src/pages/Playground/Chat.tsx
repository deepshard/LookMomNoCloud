import { useState } from "react";
import { Input } from "antd";

// @ts-ignore
import arrowUpIcon from "../../assets/icons/arrow-up.svg";
import { TModel } from "../../types/schemas";
import axios from "axios";
import { set } from "lodash";

interface ChatProps {
  model: TModel;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const Chat = ({ model }: ChatProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');

  const handleSetSystemMessage = (message: string) => {
    setSystemMessage(message);
  }

  const handleSendMessage = async (message: string) => {
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

    let value, done;
    while (!done) {
      ({ value, done } = await reader.read());

      const chunk = decoder.decode(value).substring(6).trim();
      console.log(chunk);
      const data = JSON.parse(chunk);
      console.log(data);

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
        <Input className="p-0 w-full h-[40px] bg-transparent border-none text-[16px]" placeholder="Enter system instructions..." value={systemMessage} onChange={(e) => handleSetSystemMessage(e.target.value)} />
      </div>

      {/* Messages */}
      <div className="flex flex-col items-start mb-5 w-full h-[307px] overflow-y-scroll">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-center w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-center gap-2 p-2 w-[300px] bg-white/5 mb-4 ${message.role === "user" ? "rounded-tl-sm rounded-tr-sm rounded-bl-sm" : "rounded-tl-sm rounded-tr-sm rounded-br-sm"}`}>
              <p className="text-surface-750 text-[16px]">{message.content}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Chat Input */}
      <div className="flex items-center px-3 py-2 bg-white/10 w-full h-[40px] rounded-md">
        <Input
          className="p-0 w-full h-[40px] bg-transparent border-none text-surface-750 text-[16px]"
          placeholder={`Chat with ${model.name}`}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onPressEnter={(e) => handleSendMessage(e.target.value)}
        />
        <img src={arrowUpIcon} alt="Send" className="w-5 h-5" />
      </div>
    </div>
  )
}

export default Chat;