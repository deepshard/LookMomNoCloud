import { Input } from "antd";
import Featured from "../Featured";
import ModelWidget from "../ModelWidget";
import { TModel } from "../../types/schemas";

interface SearchProps {
  onClose?: () => void;
  recentlyUsedModels?: TModel[];
}
const Search = ({ onClose, recentlyUsedModels }: SearchProps) => {
  return (
    <div className="search">
      <img src="/assets/icons/close.svg" alt="" className="absolute p-[10px] top-[20px] right-[20px]" onClick={onClose} />
      <div className="w-full mt-[131px] px-[145px]">
        <Input placeholder="Search..." className="h-[38px] bg-transparent text-[32px] border-none" />
        <div className="flex justify-between mt-[52px]">
          <Featured className="w-[303px] h-[150px] widget-3d" />
          <Featured className="w-[303px] h-[150px] widget-3d" />
        </div>
        <div className="flex justify-between mt-[42px]">
          {recentlyUsedModels?.slice(0, 4).map((model) => (
            <ModelWidget
              model={model}
              key={model.id}
              className="w-[124px] h-[78px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
