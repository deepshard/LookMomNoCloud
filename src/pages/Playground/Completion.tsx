import { Form } from "antd";
import { getCompletions } from "../../api/model";
import { TModel } from "../../types/schemas";
import { useEffect, useRef, useState } from "react";
import { Settings } from "./playgroundTypes";
import Button from "../../component/common/Button";
// @ts-ignore
import sendIcon from "../../assets/icons/send-fill.svg";
// @ts-ignore
import retryIcon from "../../assets/icons/retry.svg";
// @ts-ignore
import refreshIcon from "../../assets/icons/refresh.svg";

interface CompletionProps {
  model: TModel | null;
  settings: Settings;
}
const Completion = ({ model, settings }: CompletionProps) => {
  const [form] = Form.useForm();
  const [textIndex, setTextIndex] = useState<{ startIndex: number; endIndex: number }>({ startIndex: 0, endIndex: 0 });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      form.submit();
    }
  };

  const handleRetry = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    // Handle retry logic here
    form.setFieldValue("prompt", form.getFieldValue("prompt").substring(textIndex.startIndex, textIndex.endIndex + 1));
    form.submit();
  };

  const handleRefresh = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    // Handle retry logic here
    form.setFieldValue("prompt", "");
  };

  const onFinish = (values: any) => {
    // Handle form submission here
    textIndex.endIndex = values.prompt.length - 1;
    model &&
      getCompletions(model, values.prompt, settings, (data) => {
        form.setFieldValue("prompt", form.getFieldValue("prompt") + data.choices[0].text);
      }).then((_) => {
        setTextIndex({ ...textIndex });
      });
  };

  useEffect(() => {
    setTimeout(() => {
      console.log("textIndex");
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(textIndex.endIndex + 1, form.getFieldValue("prompt").length);
      }
    }, 500);
  }, [textIndex]);

  return (
    <Form form={form} className="w-full h-full flex flex-col" onFinish={onFinish}>
      <div className="w-full rounded-md overflow-hidden bg-surface-100 p-2 flex h-full">
        <Form.Item name="prompt" noStyle>
          <textarea ref={textAreaRef} onKeyDown={handleSubmit} className="!h-full !w-full" placeholder="Write a tagline for an ice cream..." />
        </Form.Item>
      </div>
      <div className="flex gap-2 mt-4">
        <Button className="flex gap-2 rounded-md p-2" onClick={() => form.submit()}>
           Submit <img className="w-6 h-6" src={sendIcon} alt="" />
        </Button>
        <Button className="rounded-full p-2" onClick={handleRetry}><img className="w-6 h-6" src={retryIcon} alt="" /></Button>
        <Button className="rounded-full p-2" onClick={handleRefresh}><img className="w-6 h-6" src={refreshIcon} alt="" /></Button>
      </div>
    </Form>
  );
};

export default Completion;
