import React from "react";
import ModelWidget from "../ModelWidget";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "react-lazy-load-image-component/src/effects/blur.css";
import { formatParams } from "../../utils/sysUtils";
import { TModel } from "../../types/schemas";
import { GridIcon, ListIcon, ErrorIcon } from "../SVGIcons";
import { useState, useEffect } from "react";

interface SearchResultsProps {
  searchModels?: TModel[];
  isListView: boolean;
  setIsListView: (isListView: boolean) => void;
  handleModelClick: (model: TModel) => void;
  isLoading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchModels,
  isListView,
  setIsListView,
  handleModelClick,
  isLoading,
}) => {
  const [showNoResults, setShowNoResults] = useState(false);

  useEffect(() => { // This is for preventing the glitch where the "No results found" message is shown for a split second before the loading skeleton is shown (debouncer)
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (!isLoading && !searchModels?.length) {
      timeout = setTimeout(() => {
        setShowNoResults(true);
      }, 300);
    } else {
      setShowNoResults(false);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isLoading, searchModels]);

  if (!searchModels?.length && showNoResults) {
    return (
      <>
        <div className="w-full py-3 mt-11 mb-5 flex justify-between gap-8">
          <div className="flex items-center gap-2 text-surface-750">
            <span>Text Generation</span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-surface-500 transition transition-200 opacity-${searchModels?.length ? "100" : "0"}`}>
              <span>{searchModels?.length} results</span>
            </div>

            <ViewToggle isListView={isListView} setIsListView={setIsListView} />
          </div>
        </div>

        <div className="h-[300px] w-full bg-white/[2.5%] p-4 rounded-sm flex justify-center items-center gap-2">
          <ErrorIcon className="h-[14px] w-[14px] text-white" />
          <h1 className="text-white">No results found</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full py-3 mt-11 mb-5 flex justify-between gap-8">
        <div className="flex items-center gap-2 text-surface-400">
          <span>Text Generation</span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-surface-500 transition transition-200 opacity-${searchModels?.length ? "100" : "0"}`}>
            <span>{searchModels?.length} results</span>
          </div>

          <ViewToggle isListView={isListView} setIsListView={setIsListView} />
        </div>
      </div>

      {isListView ? (
        <ListView searchModels={searchModels} handleModelClick={handleModelClick} isLoading={isLoading} />
      ) : (
        <GridView searchModels={searchModels} handleModelClick={handleModelClick}isLoading={isLoading}  />
      )}
    </>
  );
};

interface ViewToggleProps {
  isListView: boolean;
  setIsListView: (isListView: boolean) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ isListView, setIsListView }) => (
  <>
  
    <GridIcon 
    className={`cursor-pointer transition transition-200 ${
        isListView ? "fill-surface-500" : "fill-surface-750"
      }`}
      onClick={() => setIsListView(false)}/>

    <ListIcon 
      className={`cursor-pointer transition transition-200 ${
        !isListView ? "fill-surface-500" : "fill-surface-750"
      }`}
      onClick={() => setIsListView(true)}
    />
  </>
);

interface ListViewProps {
  searchModels? : TModel[];
  handleModelClick: (model: TModel) => void;
  isLoading: boolean;
}

const ListView: React.FC<ListViewProps> = ({ searchModels, handleModelClick, isLoading }) => (
  <div className="flex flex-col gap-1">
    {isLoading
      ? Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-grow w-[688px] p-3.5 justify-between items-center hover:bg-surface-main/5 rounded-md cursor-pointer transition transition-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[8px] bg-surface-main/10 animate-pulse" />
              <div className="flex flex-col gap-1 -mt-1">
                <div className="h-3.5 w-32 bg-surface-main/10 animate-pulse rounded-md" />
                <div className="h-3.5 w-24 bg-surface-main/10 animate-pulse rounded-md" />
              </div>
            </div>
            <div className="h-4 w-20 bg-surface-main/10 animate-pulse rounded-md" />
          </div>
        ))
      : searchModels?.map((model) => (
          <div
            key={model.id}
            className="flex flex-grow w-[688px] p-3.5 justify-between items-center hover:bg-surface-main/5 rounded-md cursor-pointer transition transition-100"
            onClick={() => handleModelClick(model)}
          >
            <div className="flex items-center gap-2">
              <LazyLoadImage
                src={model.lowresBackgroundImage}
                alt={model.name}
                effect="blur"
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
            <button className="text-surface-500 title-sm">View Details</button>
          </div>
        ))}
  </div>
);

interface GridViewProps {
  searchModels?: TModel[];
  handleModelClick: (model: TModel) => void;
  isLoading: boolean;
}

const GridView: React.FC<GridViewProps> = ({ searchModels, handleModelClick, isLoading }) => (
  <div className="w-full grid grid-cols-4 gap-x-[54px] gap-y-11">
    {isLoading
      ? Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className="w-[124px] h-[78px] bg-surface-main/10 animate-pulse rounded-md"
          />
        ))
      : searchModels?.map((model) => (
          <ModelWidget
            onClick={() => handleModelClick(model)}
            model={model}
            key={model.id}
            className="w-[124px] h-[78px]"
          />
        ))}
  </div>
);

export default SearchResults;