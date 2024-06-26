import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Input, InputRef } from "antd";
import { debounce } from "lodash";
import Featured from "../Featured";
import ModelWidget from "../ModelWidget";
import { useSearchModels, useGetPrediction } from "../../lib/react-query/queriesAndMutations";
import { useHomePageContext } from "../../context/HomePageProvider";
import { TModel } from "../../types/schemas";
import NoResults from "./NoResults";

interface SearchProps {
  recentlyUsedModels?: TModel[];
  onModelClick?: (model: TModel) => void;
}
const Search = ({ recentlyUsedModels, onModelClick }: SearchProps) => {
  const [search, setSearch] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [caseSensitivePredictiveText, setCaseSensitivePredictiveText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { data: searchModels, isLoading: isSearchLoading } = useSearchModels(debouncedInput);
  const { data: predictionData } = useGetPrediction(search);

  const { setSearchQuery } = useHomePageContext();

  const handleModelClick = (model: TModel) => {
    setSearchQuery(search);
    onModelClick && onModelClick(model);
  };

  useEffect(() => {
    setIsTyping(search.length > 0);
    const debouncer = debounce((value) => {
      setDebouncedInput(value);
      setIsTyping(false);
    }, 500);
    debouncer(search);

    return () => debouncer.cancel();
  }, [search]);

  useEffect(() => {
    updateCaseSensitivePredictiveText();
  }, [search, predictionData]);

  const updateCaseSensitivePredictiveText = () => {
    const predictiveText = predictionData?.[0]?.title || "";
    if (predictiveText && search) {
      const casedPrediction = predictiveText.split('').map((char, i) => {
        if (i < search.length) return search[i];
        const prevChar = search[i - 1] || predictiveText[i - 1];
        return prevChar === prevChar.toUpperCase() ? char.toUpperCase() : char.toLowerCase();
      }).join('');
      setCaseSensitivePredictiveText(casedPrediction);
    } else {
      setCaseSensitivePredictiveText(predictiveText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && predictionData?.[0]?.title) {
      e.preventDefault();
      setSearch(predictionData[0].title);
    }
  };


  const renderSearchResults = () => {
    if (isTyping || isSearchLoading) {
      return <div>loading...</div>
    }
    if (!searchModels || searchModels.length === 0) {
      return <NoResults className="min-w-[628px] min-h-[300px] mt-[94px]" />
    }
    return (
      <div className="grid grid-cols-4 gap-x-[44px] gap-y-[33px] mt-[42px]">
        {searchModels.slice(0, 12).map((model) => (
          <ModelWidget
            onClick={() => handleModelClick(model)}
            model={model}
            key={model.id}
            className="w-[124px] h-[78px]"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full mt-[131px] px-[145px]">
      <div className="relative">
        <Input
          autoFocus
          value={search}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="h-[38px] bg-transparent text-[32px] border-none relative z-10"
        />
        <Input
          value={caseSensitivePredictiveText}
          className="h-[38px] bg-transparent text-[32px] border-none text-gray-500 absolute top-0 left-0 z-0"
          readOnly
        />
      </div>
      {search.length < 1 ? (
        <>
          <div className="flex justify-between mt-[52px]">
            <Featured className="w-[303px] h-[150px] widget-3d" />
            <Featured className="w-[303px] h-[150px] widget-3d" />
          </div>
          <div className="flex justify-between mt-[42px]">{recentlyUsedModels?.slice(0, 4).map((model) => <ModelWidget onClick={() => handleModelClick(model)} model={model} key={model.id} className="w-[124px] h-[78px]" />)}</div>
        </>
      ) : (
        renderSearchResults()
      )}
    </div>
  );
};

export default Search;