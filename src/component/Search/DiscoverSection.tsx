import React, { useState } from "react";
import DiscoverItem from "./DiscoverItem";
import { useGetNewModels, useGetTrendingModels } from "../../lib/react-query/queriesAndMutations";
import { TModel } from "../../types/schemas"; // Adjust this import path as needed

const DiscoverSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"New" | "Trending">("New");

  return (
    <div className="w-full flex flex-col justify-between">
      <DiscoverTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <DiscoverGrid activeTab={activeTab} />
    </div>
  );
};

interface DiscoverTabsProps {
  activeTab: "New" | "Trending";
  setActiveTab: React.Dispatch<React.SetStateAction<"New" | "Trending">>;
}

const DiscoverTabs: React.FC<DiscoverTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs: ("New" | "Trending")[] = ["New", "Trending"];

  return (
    <div className="flex justify-center items-center gap-2.5">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 transition transition-100 ${
            activeTab === tab
              ? "text-surface-750"
              : "text-surface-400 hover:text-surface-500"
          }`}
          onClick={() => setActiveTab(tab)}
        >
          <div className={`h-3.5 w-3.5 transition transition-100 ${activeTab === tab ? "fill-surface-main" : "fill-surface-400"}`}>
            {tab === "New" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 11 15"
                className={`h-5 w-5 ${activeTab === tab ? "fill-surface-main" : "fill-surface-400"}`}
              >
                {/* New icon SVG path */}
                <g clip-path="url(#clip0_1821_14165)">
                <path d="M6.03732 13.455C6.18499 13.455 6.2929 13.3471 6.32129 13.1937C6.72454 10.087 7.16186 9.6099 10.2402 9.26917C10.3992 9.25214 10.5071 9.13857 10.5071 8.98519C10.5071 8.83755 10.3992 8.72393 10.2402 8.70689C7.16186 8.36612 6.72454 7.88904 6.32129 4.77667C6.2929 4.62332 6.18499 4.52109 6.03732 4.52109C5.88965 4.52109 5.78174 4.62332 5.75902 4.77667C5.35578 7.88904 4.91278 8.36612 1.84016 8.70689C1.67545 8.72393 1.56755 8.83755 1.56755 8.98519C1.56755 9.13857 1.67545 9.25214 1.84016 9.26917C4.9071 9.67237 5.33306 10.087 5.75902 13.1937C5.78174 13.3471 5.88965 13.455 6.03732 13.455ZM2.18661 7.17343C2.29452 7.17343 2.36836 7.09959 2.37972 6.99736C2.58418 5.48093 2.6353 5.48093 4.20283 5.17991C4.29938 5.16287 4.37322 5.09472 4.37322 4.98681C4.37322 4.88458 4.29938 4.81075 4.20283 4.79938C2.6353 4.57788 2.5785 4.52677 2.37972 2.98762C2.36836 2.87972 2.29452 2.80588 2.18661 2.80588C2.08438 2.80588 2.01054 2.87972 1.9935 2.99331C1.81176 4.50973 1.72657 4.50406 0.170385 4.79938C0.0738336 4.81642 0 4.88458 0 4.98681C0 5.1004 0.0738336 5.16287 0.193103 5.17991C1.73793 5.42981 1.81176 5.46957 1.9935 6.986C2.01054 7.09959 2.08438 7.17343 2.18661 7.17343ZM4.93549 3.26592C5.00933 3.26592 5.04908 3.22048 5.06044 3.15233C5.23083 2.23225 5.21379 2.18681 6.20202 2.01075C6.27018 1.99371 6.31561 1.95395 6.31561 1.88012C6.31561 1.81197 6.27018 1.76653 6.20202 1.75517C5.21379 1.57911 5.23083 1.53367 5.06044 0.61359C5.04908 0.545436 5.00933 0.5 4.93549 0.5C4.86166 0.5 4.8219 0.545436 4.81054 0.61359C4.64016 1.53367 4.6572 1.57911 3.66897 1.75517C3.59513 1.76653 3.55538 1.81197 3.55538 1.88012C3.55538 1.95395 3.59513 1.99371 3.66897 2.01075C4.6572 2.18681 4.64016 2.23225 4.81054 3.15233C4.8219 3.22048 4.86166 3.26592 4.93549 3.26592Z"  fill-opacity="0.75"/>
               </g>
             <defs>
               <clipPath id="clip0_1821_14165">
                 <rect width="10.5071" height="14"  transform="translate(0 0.5)"/>
               </clipPath>
             </defs>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"
                className={`h-3.5 w-3.5 ${activeTab === tab ? "fill-surface-main" : "fill-surface-400"}`}
              >
                {/* Trending icon SVG path */}
                <g clip-path="url(#clip0_1821_14173)">
               <path d="M14.333 10.9701L14.3234 1.44748C14.3234 0.907929 13.9728 0.529297 13.4041 0.529297H3.86854C3.33774 0.529297 2.97756 0.936327 2.97756 1.39069C2.97756 1.84504 3.38513 2.23315 3.83063 2.23315H7.12921L11.7548 2.08169L9.99176 3.62462L0.59841 13.0242C0.427794 13.1945 0.333008 13.4123 0.333008 13.6205C0.333008 14.0749 0.74059 14.5009 1.21452 14.5009C1.43253 14.5009 1.64106 14.4252 1.81168 14.2453L11.224 4.85517L12.788 3.08506L12.6173 7.50559V11.0079C12.6173 11.4528 13.006 11.8693 13.4704 11.8693C13.9254 11.8693 14.333 11.4812 14.333 10.9701Z" fill-opacity="0.4"/>
             </g>
             <defs>
               <clipPath id="clip0_1821_14173">
               <rect width="14" height="14" fill="white" transform="translate(0.333008 0.5)"/>
              </clipPath>
           </defs>
              </svg>
            )}
          </div>
          <p>{tab}</p>
        </button>
      ))}
    </div>
  );
};

interface DiscoverGridProps {
  activeTab: "New" | "Trending";
}

const DiscoverGrid: React.FC<DiscoverGridProps> = ({ activeTab }) => {
  const { data: trendingModels, isLoading: isTrendingLoading, error: trendingError } = useGetTrendingModels();
  const { data: newModels, isLoading: isNewLoading, error: newError } = useGetNewModels();

  const isLoading = activeTab === "Trending" ? isTrendingLoading : isNewLoading;
  const error = activeTab === "Trending" ? trendingError : newError;
  const models = activeTab === "Trending" ? trendingModels : newModels;

  if (isLoading) {
    return (
      <div className="w-full p-8 grid grid-cols-4 gap-x-6 gap-y-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="relative w-[200px] h-[228px] bg-bg-wdget glass-3d rounded-lg overflow-hidden animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) return <div>Error loading models</div>;

  return (
    <div className="w-full p-8 grid grid-cols-4 gap-x-6 gap-y-6">
      {models?.map((model: TModel) => (
        <DiscoverItem key={model.id} model={model} />
      ))}
    </div>
  );
};

export default DiscoverSection;