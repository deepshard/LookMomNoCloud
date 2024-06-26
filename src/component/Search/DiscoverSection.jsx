
// DiscoverSection.jsx
import React from "react";
import DiscoverItem from "./DiscoverItem";

const DiscoverSection = () => (
  <div className="w-full flex flex-col justify-between">
    <DiscoverTabs />
    <DiscoverGrid />
  </div>
);

const DiscoverTabs = () => {
  const tabs = ["New", "Popular", "Trending"];

  return (
    <div className="flex justify-center items-center gap-2.5">
      {tabs.map((tab) => (
        <button key={tab} className="flex gap-1.5 text-surface-400 hover:text-surface-500 px-2.5 py-1.5">
          <div className="h-3.5 w-3.5 bg-surface-400" />
          <p>{tab}</p>
        </button>
      ))}
    </div>
  );
};

const DiscoverGrid = () => (
  <div className="w-full p-8 grid grid-cols-4 gap-x-6 gap-y-6">
    {[...Array(32)].map((_, index) => (
      <DiscoverItem key={index} />
    ))}
  </div>
);

export default DiscoverSection;