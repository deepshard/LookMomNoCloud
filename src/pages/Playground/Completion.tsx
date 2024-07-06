import { Input, Form } from "antd";
import { getCompletions } from "../../api/model";
import { TModel } from "../../types/schemas";
import { useEffect, useRef, useState } from "react";

interface CompletionProps {
  model: TModel;
}
const Completion = ({ model }: CompletionProps) => {
  const [form] = Form.useForm();
  const [textIndex, setTextIndex] = useState<{startIndex: number; endIndex: number}>({startIndex: 0, endIndex: 0});
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
    form.setFieldValue("prompt", form.getFieldValue("prompt").substring(textIndex.startIndex, textIndex.endIndex+1));
    form.submit();
  };

  const handleRefresh = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    // Handle retry logic here
    form.setFieldValue("prompt", '');
  };

  const onFinish = (values: any) => {
    // Handle form submission here
    textIndex.endIndex = values.prompt.length-1;
    getCompletions(model, values.prompt, {}, (data) => {
        form.setFieldValue("prompt", form.getFieldValue("prompt") + data.choices[0].text);
    }).then((_) => {
        setTextIndex({...textIndex});
    });
  };

  useEffect(() => {
    setTimeout(() => {
        
        console.log('textIndex');
        if(textAreaRef.current) {
          textAreaRef.current.focus();
          textAreaRef.current.setSelectionRange(textIndex.endIndex+1, form.getFieldValue("prompt").length);
        }
    }, 500);
  }, [textIndex])

  return (
    <Form form={form} className="w-full h-full flex flex-col" onFinish={onFinish}>
      <div className="w-full rounded-md overflow-hidden bg-surface-100 p-2 flex h-full">
        <Form.Item name="prompt" noStyle>
          <textarea ref={textAreaRef} onKeyDown={handleSubmit}  className="!h-full !w-full" placeholder="Write a tagline for an ice cream..." />
        </Form.Item>
      </div>
      <div className="flex gap-2">
        <button onClick={() => form.submit()}>Submit</button>
        <button onClick={handleRetry}>retry</button>
        <button onClick={handleRefresh}>reload</button>
      </div>
    </Form>
  );
};

export default Completion;
