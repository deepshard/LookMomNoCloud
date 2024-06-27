import React, { useState } from "react";
import DiscoverItem from "./DiscoverItem";
import {
  useGetNewModels,
  useGetTrendingModels,
} from "../../lib/react-query/queriesAndMutations";
import { TModel } from "../../types/schemas"; // Adjust this import path as needed
import { NewTabIcon, TrendingIcon } from "../SVGIcons";
// import Logo from "../Logo";

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

const DiscoverTabs: React.FC<DiscoverTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
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
          <div
            className={`h-3.5 w-3.5 transition transition-100 ${
              activeTab === tab ? "fill-surface-main" : "fill-surface-400"
            }`}
          >
            {tab === "New" ? (
              <NewTabIcon
                className={`h-3.5 w-3.5 ${
                  activeTab === tab ? "fill-surface-main" : "fill-surface-400"
                }`}
              />
            ) : (
              <TrendingIcon
                className={`h-3.5 w-3.5 ${
                  activeTab === tab ? "fill-surface-main" : "fill-surface-400"
                }`}
              />
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
  const {
    data: trendingModels,
    isLoading: isTrendingLoading,
    error: trendingError,
  } = useGetTrendingModels();
  const {
    data: newModels,
    isLoading: isNewLoading,
    error: newError,
  } = useGetNewModels();

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
