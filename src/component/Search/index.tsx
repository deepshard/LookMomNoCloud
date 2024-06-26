import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Input } from "antd";
import ModelWidget from "../ModelWidget";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import {
useSearchModels,
  useGetPrediction,
  useGetFeatured,
} from "../../lib/react-query/queriesAndMutations";
import { useHomePageContext } from "../../context/HomePageProvider";
import { TModel } from "../../types/schemas";
// import Title from "antd/es/skeleton/Title";
import ModelWidgetSkeleton from "../ModelWidgetSkeleton/ModelWidgetSkeleton";
import { formatParams } from "../../utils/sysUtils";

import DiscoverItem from "./DiscoverItem";

interface SearchProps {
  onModelClick?: (model: TModel) => void;
}
const Search = ({ onModelClick }: SearchProps) => {
  const [search, setSearch] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [caseSensitivePredictiveText, setCaseSensitivePredictiveText] =
    useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [isListView, setIsListView] = useState(true);

  const [featuredModels, setFeaturedModels] = useState<TModel[]>([]);

  const { data: searchModels, isLoading: isSearchLoading } = useSearchModels(debouncedInput);
  const { data: predictionData } = useGetPrediction(search);
  const { data: featuredData } = useGetFeatured();

  const navigate = useNavigate();
  const { setSearchQuery } = useHomePageContext();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchIcon = "/src/assets/icons/search-suggestions.svg";

  useLayoutEffect(() => {
    inputRef.current?.focus();
    setFeaturedModels(featuredData ?? []);
  }, [featuredData]);
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
      const casedPrediction = predictiveText
        .split("")
        .map((char, i) => {
          if (i < search.length) return search[i];
          const prevChar = search[i - 1] || predictiveText[i - 1];
          return prevChar === prevChar.toUpperCase()
            ? char.toUpperCase()
            : char.toLowerCase();
        })
        .join("");
      setCaseSensitivePredictiveText(casedPrediction);
    } else {
      setCaseSensitivePredictiveText(predictiveText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && predictionData?.[0]?.title) {
      e.preventDefault();
      setSearch(predictionData[0].title);
    }
  };
  const renderSearchResults = () => {
    if (!searchModels) return (
      <div className="w-full flex flex-col gap-1">
        {[...Array(8)].map((_, index) => (
          <ModelWidgetSkeleton key={index}  />
        ))}
      </div>
    );

    return !isListView ? (
      <div className="w-full grid grid-cols-4 gap-x-[54px] gap-y-11">
        {searchModels.slice(0, searchModels.length).map((model) => (
          <ModelWidget
            onClick={() => handleModelClick(model)}
            model={model}
            key={model.id}
            className="w-[124px] h-[78px]"
          />
        ))}
      </div>
    ) : (
      <div className="flex flex-col gap-1">
        {searchModels.map((model) => (
          <div
            key={model.id}
            className="flex flex-grow w-[688px] p-3.5 justify-between items-center hover:bg-surface-main/5 rounded-md cursor-pointer"
            onClick={() => handleModelClick(model)}
          >
            <div className="flex items-center gap-2">
              <img
                src={model.backgroundImage}
                alt={model.name}
                className="w-8 h-8 rounded-[8px]"
              />

              <div className="flex flex-col gap-1 -mt-1">
                <p className="text-surface-750 title-sm h-3.5 leading-tight">
                  {model.name}
                </p>
                <p className="text-surface-500 text-xs h-3.5 leading-normal">
                  {`${model.author} • ${formatParams(model.size)}`}
                </p>
              </div>
            </div>

            <button className="text-surface-500 title-sm">
              View Details
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mt-32 max-w-[660px] flex flex-col justify-start items-center ">
        <div className="w-full relative">
          <Input
            ref={inputRef}
            value={search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="-mx-[11px] h-[38px] bg-transparent text-[32px] border-none relative z-10 text-white capitalize"
          />
          <Input
            value={caseSensitivePredictiveText}
            className="-mx-[11px] h-[38px] bg-transparent text-[32px] border-none text-gray-500 absolute top-0 left-0 z-0 capitalize"
            readOnly
          />
        </div>
        
        {(isTyping || isSearchLoading) && (
          <h1>loading..</h1>
        )}

        {search.length < 1 ? (
          <>
            <div className="w-full flex flex-col justify-between my-14 gap-y-11">
              <div className="flex w-full justify-between items-center gap-x-[54px]">
                <SearchSuggestions
                  title="Best math models"
                  count={65}
                  icon={searchIcon}
                  onClick={() => setSearch("Best math models")}
                  className="bg-bg-wdget rounded-md p-2.5 flex items-center space-x-2 glass-3d w-full transition-transform cursor-pointer"
                />
                <SearchSuggestions
                  title="Best models for code"
                  count={279}
                  icon={searchIcon}
                  onClick={() => setSearch("Best models for code")}
                  className="bg-bg-wdget rounded-md p-2.5 flex items-center space-x-2 glass-3d w-full transition-transform cursor-pointer"
                />
              </div>

              <div className="w-full grid grid-cols-4 justify-between gap-x-[54px] gap-y-11">
                {featuredModels?.map((model) => (
                  <ModelWidget
                    model={model}
                    key={model.id}
                    className="w-[124px] h-[78px]"
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <>
              <div className="w-full py-3 mt-11 mb-5 flex justify-between gap-8">
                <div className="flex items-center gap-2 text-surface-750">
                  <span>Text Generation</span>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={` flex items-center gap-2 text-surface-500 transition transition-200 opacity-${
                      searchModels?.length ? "100" : "0"
                    }`}
                  >
                    <span>{searchModels?.length} results</span>
                  </div>

                  {/* Grid view icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    className={`cursor-pointer transition transition-200 ` + (isListView ? "fill-surface-500" : "fill-surface-750")}
                    onClick={() => setIsListView(false)}
                  >
                    <g clip-path="url(#clip0_1383_14238)">
                      <path
                        d="M1.30566 5.74219H4.42285C5.29102 5.74219 5.72852 5.30469 5.72852 4.40234V1.34668C5.72852 0.444336 5.29102 0.0136719 4.42285 0.0136719H1.30566C0.4375 0.0136719 0 0.444336 0 1.34668V4.40234C0 5.30469 0.4375 5.74219 1.30566 5.74219ZM1.31934 4.77832C1.08008 4.77832 0.963867 4.65527 0.963867 4.40234V1.34668C0.963867 1.10059 1.08008 0.977539 1.31934 0.977539H4.40234C4.6416 0.977539 4.76465 1.10059 4.76465 1.34668V4.40234C4.76465 4.65527 4.6416 4.77832 4.40234 4.77832H1.31934ZM8.16895 5.74219H11.2793C12.1475 5.74219 12.585 5.30469 12.585 4.40234V1.34668C12.585 0.444336 12.1475 0.0136719 11.2793 0.0136719H8.16895C7.29395 0.0136719 6.85645 0.444336 6.85645 1.34668V4.40234C6.85645 5.30469 7.29395 5.74219 8.16895 5.74219ZM8.18262 4.77832C7.93652 4.77832 7.82031 4.65527 7.82031 4.40234V1.34668C7.82031 1.10059 7.93652 0.977539 8.18262 0.977539H11.2656C11.5049 0.977539 11.6211 1.10059 11.6211 1.34668V4.40234C11.6211 4.65527 11.5049 4.77832 11.2656 4.77832H8.18262ZM1.30566 12.5986H4.42285C5.29102 12.5986 5.72852 12.168 5.72852 11.2656V8.20312C5.72852 7.30762 5.29102 6.87012 4.42285 6.87012H1.30566C0.4375 6.87012 0 7.30762 0 8.20312V11.2656C0 12.168 0.4375 12.5986 1.30566 12.5986ZM1.31934 11.6348C1.08008 11.6348 0.963867 11.5117 0.963867 11.2656V8.20996C0.963867 7.95703 1.08008 7.83398 1.31934 7.83398H4.40234C4.6416 7.83398 4.76465 7.95703 4.76465 8.20996V11.2656C4.76465 11.5117 4.6416 11.6348 4.40234 11.6348H1.31934ZM8.16895 12.5986H11.2793C12.1475 12.5986 12.585 12.168 12.585 11.2656V8.20312C12.585 7.30762 12.1475 6.87012 11.2793 6.87012H8.16895C7.29395 6.87012 6.85645 7.30762 6.85645 8.20312V11.2656C6.85645 12.168 7.29395 12.5986 8.16895 12.5986ZM8.18262 11.6348C7.93652 11.6348 7.82031 11.5117 7.82031 11.2656V8.20996C7.82031 7.95703 7.93652 7.83398 8.18262 7.83398H11.2656C11.5049 7.83398 11.6211 7.95703 11.6211 8.20996V11.2656C11.6211 11.5117 11.5049 11.6348 11.2656 11.6348H8.18262Z"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1383_14238">
                        <rect width="12.585" height="12.5986" />
                      </clipPath>
                    </defs>
                  </svg>{" "}

                  {/* List view icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="10"
                    viewBox="0 0 14 10"
                    className={`cursor-pointer transition transition-200 ` + (!isListView ? "fill-surface-500" : "fill-surface-750")}
                    onClick={() => setIsListView(true)}

                  >
                    <g clipPath="url(#clip0_1383_14246)">
                      <path
                        fill="fill-surface-750"
                        d="M3.88281 1.42188H13.2207C13.5283 1.42188 13.7744 1.18262 13.7744 0.875C13.7744 0.560547 13.5283 0.321289 13.2207 0.321289H3.88281C3.56836 0.321289 3.3291 0.560547 3.3291 0.875C3.3291 1.18262 3.56836 1.42188 3.88281 1.42188ZM3.88281 5.55762H13.2207C13.5283 5.55762 13.7744 5.31152 13.7744 5.00391C13.7744 4.69629 13.5283 4.45703 13.2207 4.45703H3.88281C3.56836 4.45703 3.3291 4.69629 3.3291 5.00391C3.3291 5.31152 3.56836 5.55762 3.88281 5.55762ZM3.88281 9.68652H13.2207C13.5283 9.68652 13.7744 9.44727 13.7744 9.13965C13.7744 8.8252 13.5283 8.58594 13.2207 8.58594H3.88281C3.56836 8.58594 3.3291 8.8252 3.3291 9.13965C3.3291 9.44727 3.56836 9.68652 3.88281 9.68652ZM0.861328 1.72949C1.33984 1.72949 1.72266 1.34668 1.72266 0.875C1.72266 0.396484 1.33984 0.0136719 0.861328 0.0136719C0.382812 0.0136719 0 0.396484 0 0.875C0 1.34668 0.382812 1.72949 0.861328 1.72949ZM0.861328 5.86523C1.33984 5.86523 1.72266 5.48242 1.72266 5.00391C1.72266 4.52539 1.33984 4.14258 0.861328 4.14258C0.382812 4.14258 0 4.52539 0 5.00391C0 5.48242 0.382812 5.86523 0.861328 5.86523ZM0.861328 10.001C1.33984 10.001 1.72266 9.61133 1.72266 9.13965C1.72266 8.66113 1.33984 8.27832 0.861328 8.27832C0.382812 8.27832 0 8.66113 0 9.13965C0 9.61133 0.382812 10.001 0.861328 10.001Z"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1383_14246">
                        <rect width="13.7744" height="10.001" />
                      </clipPath>
                    </defs>
                  </svg>{" "}
                </div>
              </div>
              {renderSearchResults()}
            </>
          </>
        )}
      </div>

      {/* DISCOVER SECTION */}
      <div className="w-full flex flex-col justify-between">
        {/* DISCOVER TAB */}
        <div className="flex justify-center items-center gap-2.5">
          <button className="flex gap-1.5 text-surface-400 hover:text-surface-500 px-2.5 py-1.5">
            <div className="h-3.5 w-3.5 bg-surface-400" />
            <p>New</p>
          </button>

          <button className="flex gap-1.5 text-surface-400 hover:text-surface-500 px-2.5 py-1.5">
            <div className="h-3.5 w-3.5 bg-surface-400" />
            <p>Popular</p>
          </button>

          <button className="flex gap-1.5 text-surface-400 hover:text-surface-500 px-2.5 py-1.5">
            <div className="h-3.5 w-3.5 bg-surface-400" />
            <p>Trending</p>
          </button>
        </div>

        {/* DISCOVER GRID */}
        <div className="w-full p-8 grid grid-cols-4 gap-x-6 gap-y-6">
          {/* TO DO: Replace for Model's Image */}
          {[...Array(32)].map((_, index) => (
            // <div key={index} className="w-[200px] h-[228px] bg-bg-wdget glass-3d rounded-lg" />
            <DiscoverItem key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const SearchSuggestions = ({ title, count, icon, ...rest }) => {
  return (
    <div {...rest}>
      <div className="rounded-xs p-2 w-10 h-10 bg-surface-main/0 flex justify-center">
        <img src={icon} className="w-4" />
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-surface-main text-xs capitalize">{title}</span>
        <span className="text-surface-750 text-xs capitalize">
          {count} Suggestions
        </span>
      </div>
    </div>
  );
};

export default Search;
