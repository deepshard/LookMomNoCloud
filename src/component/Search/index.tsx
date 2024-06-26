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
  const [search, setSearch] = useState<string>("");
  const [debouncedInput, setDebouncedInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListView, setIsListView] = useState<boolean>(false);
  const [featuredModels, setFeaturedModels] = useState<TModel[] | null>([]);

  const { data: searchModels, isLoading: isSearchLoading } =
    useSearchModels(debouncedInput);
  const { data: predictionData } = useGetPrediction(search);
  const { data: featuredData } = useGetFeatured();

  const { setSearchQuery, showDiscover } = useHomePageContext();

  const discoverSectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setFeaturedModels(featuredData ?? []);
  }, [featuredData]);

  useEffect(() => {
    setIsTyping(search.length > 0);
    const debouncer = debounce((value: string) => {
      setDebouncedInput(value);
      setIsTyping(false);
    }, 500);
    debouncer(search);

    return () => debouncer.cancel();
  }, [search]);

  useEffect(() => {
    if (showDiscover && discoverSectionRef.current) {
      discoverSectionRef.current.scrollIntoView({ behavior: 'smooth', });
    }
  }, [showDiscover]);

  const handleModelClick = (model: TModel) => {
    setSearchQuery(search);
    onModelClick && onModelClick(model);
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full h-full mt-32 max-w-[660px] flex flex-col justify-start items-center">
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
            searchModels={searchModels}
            isListView={isListView}
            setIsListView={setIsListView}
            handleModelClick={handleModelClick}
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