import { Input } from "antd";

interface CompletionProps {}
const Completion = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full rounded-md overflow-hidden bg-surface-100 p-3 flex h-full">
        <Input.TextArea autoSize className="!h-full" placeholder="Write a tagline for an ice cream..." />
      </div>
      <div className="flex gap-2">
        <button className="bg-surface-100 rounded-sm flex gap-2 py-2 pr-2 pl-3 backdrop-blur-[50px]">Submit</button>
        <button className="bg-surface-100 rounded-sm flex gap-2 py-2 pr-2 pl-3 backdrop-blur-[50px]">retry</button>
        <button className="bg-surface-100 rounded-sm flex gap-2 py-2 pr-2 pl-3 backdrop-blur-[50px]">reload</button>
      </div>
    </div>
  );
};

export default Completion;
