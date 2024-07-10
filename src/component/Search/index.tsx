import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { debounce } from "lodash";
import {
  useSearchModels,
  useGetPrediction,
  useGetFeatured,
} from "../../lib/react-query/queriesAndMutations";
import { useHomePageContext } from "../../context/HomePageProvider";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import FeaturedModels from "./FeaturedModels";
import SearchSuggestions from "./SearchSuggestions";
import DiscoverSection from "./DiscoverSection";
import { TModel } from "../../types/schemas";

interface SearchProps {
  onModelClick?: (model: TModel) => void;
}

const Search: React.FC<SearchProps> = ({ onModelClick }) => {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [debouncedInput, setDebouncedInput] = useState<string>("");
  const [isListView, setIsListView] = useState<boolean>(true);
  const [featuredModels, setFeaturedModels] = useState<TModel[] | null>([]);
  const { data: searchModels, isLoading: isSearchLoading } = useSearchModels(debouncedInput);

  const { data: predictionData, isLoading: isPredictionLoading } = useGetPrediction(search);
  const { data: featuredData } = useGetFeatured();

  const { setSearchQuery, searchQuery, showDiscover } = useHomePageContext();

  const discoverSectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setFeaturedModels(featuredData ?? []);
  }, [featuredData]);

  useEffect(() => {
    if (searchQuery) {
      setSearch(searchQuery);
      setSearchQuery("");
    }

    setIsTyping(true);

    const debouncer = debounce((value: string) => {
      setDebouncedInput(value);
      setIsTyping(false);
    }, 300);
    debouncer(search);

    return () => {
      debouncer.cancel();
      setIsTyping(false);
    }
  }, [search]);



  useEffect(() => {
    if (showDiscover && discoverSectionRef.current) {
      discoverSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showDiscover]);

  const handleModelClick = (model: TModel) => {
    setSearchQuery(search);
    onModelClick && onModelClick(model);
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full h-full mt-32 max-w-[740px] flex flex-col justify-start items-center">
        <SearchInput
          search={search}
          setSearch={setSearch}
          predictionData={predictionData}
        />

        {search.length < 1 ? (
          <div className="w-full flex flex-col justify-between my-14 gap-y-11">
            <SearchSuggestions setSearch={setSearch} />
            {featuredModels && (
              <FeaturedModels featuredModels={featuredModels} />
            )}
          </div>
        ) : (
          <SearchResults
            searchModels={
              [...(predictionData ?? []), ...(searchModels ?? [])].filter(
                (v, i, a) => a.findIndex((t) => t.id === v.id) === i
              ) // concatenates prediction data and search models and removes duplicates
            }
            isListView={isListView}
            setIsListView={setIsListView}
            handleModelClick={handleModelClick}
            isLoading={!predictionData || !searchModels || isSearchLoading || isPredictionLoading || isTyping}
          />
        )}
      </div>

      {search.length < 1 && (
        <div ref={discoverSectionRef}>
          <DiscoverSection />
        </div>
      )}
    </div>
  );
};

export default Search;
