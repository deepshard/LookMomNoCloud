import React from "react";
import ModelWidget from "../ModelWidget";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import "react-lazy-load-image-component/src/effects/blur.css";
import { formatParams } from "../../utils/sysUtils";
import { TModel } from "../../types/schemas";

interface SearchResultsProps {
  searchModels: TModel[] | null;
  isListView: boolean;
  setIsListView: (isListView: boolean) => void;
  handleModelClick: (model: TModel) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchModels,
  isListView,
  setIsListView,
  handleModelClick,
}) => {
  if (searchModels?.length === 0) {
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

        <div className="h-[300px] w-full bg-surface-100 p-4 rounded-sm flex justify-center items-center gap-2">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <g clip-path="url(#clip0_1569_13739)">
              <path
                d="M6.97266 13.9453C10.7871 13.9453 13.9453 10.7803 13.9453 6.97266C13.9453 3.1582 10.7803 0 6.96582 0C3.1582 0 0 3.1582 0 6.97266C0 10.7803 3.16504 13.9453 6.97266 13.9453ZM6.97266 8.24414C6.61719 8.24414 6.41895 8.0459 6.41211 7.68359L6.32324 3.95801C6.31641 3.5957 6.58301 3.33594 6.96582 3.33594C7.3418 3.33594 7.62207 3.60254 7.61523 3.96484L7.51953 7.68359C7.5127 8.05273 7.31445 8.24414 6.97266 8.24414ZM6.97266 10.5342C6.5625 10.5342 6.20703 10.2061 6.20703 9.80273C6.20703 9.39941 6.55566 9.06445 6.97266 9.06445C7.38965 9.06445 7.73828 9.39258 7.73828 9.80273C7.73828 10.2129 7.38281 10.5342 6.97266 10.5342Z"
                fill="white"
                fill-opacity="0.85"
              />
            </g>
            <defs>
              <clipPath id="clip0_1569_13739">
                <rect width="13.9453" height="13.9521" fill="white" />
              </clipPath>
            </defs>
          </svg>
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
        <ListView searchModels={searchModels} handleModelClick={handleModelClick} />
      ) : (
        <GridView searchModels={searchModels} handleModelClick={handleModelClick} />
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 13 13"
      className={`cursor-pointer transition transition-200 ${
        isListView ? "fill-surface-500" : "fill-surface-750"
      }`}
      onClick={() => setIsListView(false)}
    >
      <g clip-path="url(#clip0_1383_14238)">
        <path
          d="M1.30566 5.74219H4.42285C5.29102 5.74219 5.72852 5.30469 5.72852 4.40234V1.34668C5.72852 0.444336 5.29102 0.0136719 4.42285 0.0136719H1.30566C0.4375 0.0136719 0 0.444336 0 1.34668V4.40234C0 5.30469 0.4375 5.74219 1.30566 5.74219ZM1.31934 4.77832C1.08008 4.77832 0.963867 4.65527 0.963867 4.40234V1.34668C0.963867 1.10059 1.08008 0.977539 1.31934 0.977539H4.40234C4.6416 0.977539 4.76465 1.10059 4.76465 1.34668V4.40234C4.76465 4.65527 4.6416 4.77832 4.40234 4.77832H1.31934ZM8.16895 5.74219H11.2793C12.1475 5.74219 12.585 5.30469 12.585 4.40234V1.34668C12.585 0.444336 12.1475 0.0136719 11.2793 0.0136719H8.16895C7.29395 0.0136719 6.85645 0.444336 6.85645 1.34668V4.40234C6.85645 5.30469 7.29395 5.74219 8.16895 5.74219ZM8.18262 4.77832C7.93652 4.77832 7.82031 4.65527 7.82031 4.40234V1.34668C7.82031 1.10059 7.93652 0.977539 8.18262 0.977539H11.2656C11.5049 0.977539 11.6211 1.10059 11.6211 1.34668V4.40234C11.6211 4.65527 11.5049 4.77832 11.2656 4.77832H8.18262ZM1.30566 12.5986H4.42285C5.29102 12.5986 5.72852 12.168 5.72852 11.2656V8.20312C5.72852 7.30762 5.29102 6.87012 4.42285 6.87012H1.30566C0.4375 6.87012 0 7.30762 0 8.20312V11.2656C0 12.168 0.4375 12.5986 1.30566 12.5986ZM1.31934 11.6348C1.08008 11.6348 0.963867 11.5117 0.963867 11.2656V8.20996C0.963867 7.95703 1.08008 7.83398 1.31934 7.83398H4.40234C4.6416 7.83398 4.76465 7.95703 4.76465 8.20996V11.2656C4.76465 11.5117 4.6416 11.6348 4.40234 11.6348H1.31934ZM8.16895 12.5986H11.2793C12.1475 12.5986 12.585 12.168 12.585 11.2656V8.20312C12.585 7.30762 12.1475 6.87012 11.2793 6.87012H8.16895C7.29395 6.87012 6.85645 7.30762 6.85645 8.20312V11.2656C6.85645 12.168 7.29395 12.5986 8.16895 12.5986ZM8.18262 11.6348C7.93652 11.6348 7.82031 11.5117 7.82031 11.2656V8.20996C7.82031 7.95703 7.93652 7.83398 8.18262 7.83398H11.2656C11.5049 7.83398 11.6211 7.95703 11.6211 8.20996V11.2656C11.6211 11.5117 11.5049 11.6348 11.2656 11.6348H8.18262Z"
          fill="fill-surface-750"
        />
      </g>
      <defs>
        <clipPath id="clip0_1383_14238">
          <rect width="12.585" height="12.5986" />
        </clipPath>
      </defs>
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="10"
      viewBox="0 0 14 10"
      className={`cursor-pointer transition transition-200 ${
        !isListView ? "fill-surface-500" : "fill-surface-750"
      }`}
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
    </svg>
  </>
);

interface ListViewProps {
  searchModels: TModel[] | null;
  handleModelClick: (model: TModel) => void;
}

const ListView: React.FC<ListViewProps> = ({ searchModels, handleModelClick }) => (
  <div className="flex flex-col gap-1">
    {!searchModels
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
      : searchModels.map((model) => (
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
  searchModels: TModel[] | null;
  handleModelClick: (model: TModel) => void;
}

const GridView: React.FC<GridViewProps> = ({ searchModels, handleModelClick }) => (
  <div className="w-full grid grid-cols-4 gap-x-[54px] gap-y-11">
    {!searchModels
      ? Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className="w-[124px] h-[78px] bg-surface-main/10 animate-pulse rounded-md"
          />
        ))
      : searchModels.map((model) => (
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