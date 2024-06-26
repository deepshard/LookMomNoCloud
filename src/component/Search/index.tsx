import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
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

const Search = ({ onModelClick }) => {
  const [search, setSearch] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListView, setIsListView] = useState(true);
  const [featuredModels, setFeaturedModels] = useState([]);

  const { data: searchModels, isLoading: isSearchLoading } = useSearchModels(
    debouncedInput,
  )
  const { data: predictionData } = useGetPrediction(search)
  const { data: featuredData } = useGetFeatured()

  const navigate = useNavigate();
  const { setSearchQuery } = useHomePageContext();
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    inputRef.current?.focus();
    setFeaturedModels(featuredData ?? []);
  }, [featuredData]);

  useEffect(() => {
    setIsTyping(search.length > 0)
    const debouncer = debounce((value) => {
      setDebouncedInput(value)
      setIsTyping(false)
    }, 500)
    debouncer(search)

    return () => debouncer.cancel()
  }, [search])

  const handleModelClick = (model) => {
    setSearchQuery(search);
    onModelClick && onModelClick(model);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mt-32 max-w-[660px] flex flex-col justify-start items-center">
        <SearchInput
          inputRef={inputRef}
          search={search}
          setSearch={setSearch}
          predictionData={predictionData}
        />
        
        {(isTyping || isSearchLoading) && <h1>loading..</h1>}

        {search.length < 1 ? (
          <div className="w-full flex flex-col justify-between my-14 gap-y-11">
            <SearchSuggestions setSearch={setSearch} />
            <FeaturedModels featuredModels={featuredModels} />
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

      <DiscoverSection />
    </div>
  )
}

export default Search
