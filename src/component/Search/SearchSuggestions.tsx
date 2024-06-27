import React from "react";

interface Suggestion {
  title: string;
  count: number;
}

interface SearchSuggestionsProps {
  setSearch: (search: string) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ setSearch }) => {
  const searchIcon = "/src/assets/icons/search-suggestions.svg";

  const suggestions: Suggestion[] = [
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

interface SuggestionItemProps extends Suggestion {
  icon: string;
  onClick: () => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ title, count, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white bg-opacity-[2.5%] rounded-md p-2.5 flex items-center space-x-2 w-full transition-transform cursor-pointer"
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