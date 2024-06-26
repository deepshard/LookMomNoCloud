
// SearchSuggestions.jsx
import React from "react";

const SearchSuggestions = ({ setSearch }) => {
  const searchIcon = "/src/assets/icons/search-suggestions.svg";

  const suggestions = [
    { title: "Best math models", count: 65 },
    { title: "Best models for code", count: 279 },
  ];

  return (
    <div className="flex w-full justify-between items-center gap-x-[54px]">
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={index}
          {...suggestion}
          icon={searchIcon}
          onClick={() => setSearch(suggestion.title)}
        />
      ))}
    </div>
  );
};

const SuggestionItem = ({ title, count, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-bg-wdget rounded-md p-2.5 flex items-center space-x-2 glass-3d w-full transition-transform cursor-pointer"
  >
    <div className="rounded-xs p-2 w-10 h-10 bg-surface-main/0 flex justify-center">
      <img src={icon} className="w-6" alt="Search suggestion icon" />
    </div>
    <div className="flex flex-col justify-center">
      <span className="text-surface-main text-xs capitalize">{title}</span>
      <span className="text-surface-750 text-xs capitalize">
        {count} Suggestions
      </span>
    </div>
  </div>
);

export default SearchSuggestions;
