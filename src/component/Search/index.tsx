import { Input } from "antd";
import Featured from "../Featured";
import ModelWidget from "../ModelWidget";
import { TModel } from "../../types/schemas";
import { debounce } from "lodash";
import { useSearchModels } from "../../lib/react-query/queriesAndMutations";
import { useEffect, useState } from "react";
interface SearchProps {
  onClose?: () => void;
  recentlyUsedModels?: TModel[];
}
const Search = ({ onClose, recentlyUsedModels }: SearchProps) => {
  const [search, setSearch] = useState("");
  const { data: searchModels, refetch: onSearchModels, isLoading } = useSearchModels(search);

  useEffect(() => {
    const handleSearch = debounce(() => {
      onSearchModels();
    }, 500);

    if (search.length) {
      handleSearch();
    }
  }, [search]);

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose && onClose();
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, []);

  return (
    <div className="search">
      <img src="/assets/icons/close.svg" alt="" className="absolute cursor-pointer p-[10px] top-[20px] right-[20px]" onClick={onClose} />
      <div className="w-full mt-[131px] px-[145px]">
        <Input autoFocus onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="h-[38px] bg-transparent text-[32px] border-none" />
        {search.length < 1 ? (
          <>
            <div className="flex justify-between mt-[52px]">
              <Featured className="w-[303px] h-[150px] widget-3d" />
              <Featured className="w-[303px] h-[150px] widget-3d" />
            </div>
            <div className="flex justify-between mt-[42px]">{recentlyUsedModels?.slice(0, 4).map((model) => <ModelWidget model={model} key={model.id} className="w-[124px] h-[78px]" />)}</div>
          </>
        ) : (
          <>
            {isLoading ? (
              <>loading...</>
            ) : (
              <>
                {searchModels ? (
                  <>
                    <div className="flex justify-between mt-[42px]">{searchModels?.slice(0, 8).map((model) => <ModelWidget model={model} key={model.id} className="w-[124px] h-[78px]" />)}</div>
                  </>
                ) : (
                  <p>
                    No results
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
