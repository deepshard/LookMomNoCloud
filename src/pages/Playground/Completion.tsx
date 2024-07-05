import { Input } from "antd";

interface CompletionProps {}
const Completion = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full rounded-md overflow-hidden bg-surface-100 p-2 flex h-full">
        <Input.TextArea autoSize className="!h-full" placeholder="Write a tagline for an ice cream..." />
      </div>
      <div className="flex gap-2">
        <button>Submit</button>
        <button>retry</button>
        <button>reload</button>
      </div>
    </div>
  );
};

export default Completion;
