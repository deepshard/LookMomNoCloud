import { Input } from "antd";
import Featured from "../Featured";
import ModelWidget from "../ModelWidget";
import { TModel } from "../../types/schemas";
import { debounce } from "lodash";
import { useSearchModels } from "../../lib/react-query/queriesAndMutations";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHomePageContext } from "../../context/HomePageProvider";

interface SearchProps {
  recentlyUsedModels?: TModel[];
}
const Search = ({ recentlyUsedModels }: SearchProps) => {
  const [search, setSearch] = useState("");
  const [debouncedInput, setDebouncedInput] = useState(search);
  const { data: searchModels, isLoading } = useSearchModels(debouncedInput);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const { setSearchQuery } = useHomePageContext();

  const handleModelClick = (model: TModel) => {
    setSearchQuery(search);
    navigate(`/model/${model.id}`, { state: { model } });
  };

  useEffect(() => {
    setIsTyping(search.length > 0);
    const debouncer = debounce((value) => {
      setDebouncedInput(value);
      setIsTyping(false);
    }, 500); // Debounce for 300 milliseconds
    debouncer(search);

    // Cleanup function to cancel any pending updates if the component unmounts
    return () => {
      debouncer.cancel();
    };
  }, [search]);

  const loadingState = isTyping || isLoading;

  return (
    <div className="w-full mt-[131px] px-[145px]">
      <Input autoFocus onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="h-[38px] bg-transparent text-[32px] border-none" />
      {search.length < 1 ? (
        <>
          <div className="flex justify-between mt-[42px]">{recentlyUsedModels?.slice(0, 4).map((model) => <ModelWidget model={model} key={model.id} className="w-[124px] h-[78px]" />)}</div>
        </>
      ) : (
        <>
          {loadingState ? (
            <>loading...</>
          ) : (
            <>
              {searchModels ? (
                <>
                  <div className="grid grid-cols-4 gap-x-[44px] gap-y-[33px] mt-[42px]">
                    {searchModels?.slice(0, 12).map((model) => <ModelWidget onClick={() => handleModelClick(model)} model={model} key={model.id} className="w-[124px] h-[78px]" />)}
                  </div>
                </>
              ) : (
                <p>No results</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
