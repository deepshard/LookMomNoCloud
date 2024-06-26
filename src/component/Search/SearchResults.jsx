
// SearchResults.jsx
import React from "react";
import ModelWidget from "../ModelWidget";
import ModelWidgetSkeleton from "../ModelWidgetSkeleton/ModelWidgetSkeleton";
import { formatParams } from "../../utils/sysUtils";

const SearchResults = ({ searchModels, isListView, setIsListView, handleModelClick }) => {
  if (!searchModels) {
    return (
      <div className="w-full flex flex-col gap-1">
        {[...Array(8)].map((_, index) => (
          <ModelWidgetSkeleton key={index} />
        ))}
      </div>
    );
  }

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

      {isListView ? (
        <ListView searchModels={searchModels} handleModelClick={handleModelClick} />
      ) : (
        <GridView searchModels={searchModels} handleModelClick={handleModelClick} />
      )}
    </>
  );
};

const ViewToggle = ({ isListView, setIsListView }) => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 13 13"
      className={`cursor-pointer transition transition-200 ${isListView ? "fill-surface-500" : "fill-surface-750"}`}
      onClick={() => setIsListView(false)}
    >
      {/* Grid view icon SVG path */}
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="10"
      viewBox="0 0 14 10"
      className={`cursor-pointer transition transition-200 ${!isListView ? "fill-surface-500" : "fill-surface-750"}`}
      onClick={() => setIsListView(true)}
    >
      {/* List view icon SVG path */}
    </svg>
  </>
);

const ListView = ({ searchModels, handleModelClick }) => (
  <div className="flex flex-col gap-1">
    {searchModels.map((model) => (
      <div
        key={model.id}
        className="flex flex-grow w-[688px] p-3.5 justify-between items-center hover:bg-surface-main/5 rounded-md cursor-pointer transition transition-100"
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
        <button className="text-surface-500 title-sm">View Details</button>
      </div>
    ))}
  </div>
);

const GridView = ({ searchModels, handleModelClick }) => (
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
);

export default SearchResults;