import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { debounce } from "lodash";
import { useSearchModels, useGetPrediction, useGetFeatured } from "../../lib/react-query/queriesAndMutations";
import { useHomePageContext } from "../../context/HomePageProvider";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import FeaturedModels from "./FeaturedModels";
import SearchSuggestions from "./SearchSuggestions";
import DiscoverSection from "./DiscoverSection";
import { TModel } from "../../types/schemas";

const Search = ({ onModelClick }) => {
  const [search, setSearch] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [featuredModels, setFeaturedModels] = useState<TModel[] | null>([]);

  const { data: searchModels, isLoading: isSearchLoading } = useSearchModels(debouncedInput);
  const { data: predictionData } = useGetPrediction(search);
  const { data: featuredData } = useGetFeatured();

  const { setSearchQuery } = useHomePageContext();

  useLayoutEffect(() => {
    setFeaturedModels(featuredData ?? []);
  }, [featuredData]);

  useEffect(() => {
    setIsTyping(search.length > 0);
    const debouncer = debounce((value) => {
      setDebouncedInput(value);
      setIsTyping(false);
    }, 500);
    debouncer(search);

    return () => debouncer.cancel();
  }, [search]);

  const handleModelClick = (model) => {
    setSearchQuery(search);
    onModelClick && onModelClick(model);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mt-32 max-w-[660px] flex flex-col justify-start items-center">
        <SearchInput search={search} setSearch={setSearch} predictionData={predictionData} />

        {(isTyping || isSearchLoading) && <div className="w-full skeleton-model-widget h-40 bg-gray-200 rounded-md animate-pulse"></div>}
        {search.length < 1 ? (
          <div className="w-full flex flex-col justify-between my-14 gap-y-11">
            <SearchSuggestions setSearch={setSearch} />
            {featuredModels && <FeaturedModels featuredModels={featuredModels} />}
          </div>
        ) : (
          <SearchResults searchModels={searchModels} isListView={isListView} setIsListView={setIsListView} handleModelClick={handleModelClick} />
        )}
      </div>

      <DiscoverSection />
    </div>
  );
};

export default Search;
