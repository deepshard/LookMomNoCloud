import { Dispatch, createContext, useContext, useState } from "react";

interface HomePageContextProps {
  showSearch: boolean;
  setShowSearch: Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<React.SetStateAction<string>>;
  showMyModels: boolean;
  setShowMyModels: Dispatch<React.SetStateAction<boolean>>;
}

const HomePageContext = createContext<HomePageContextProps>({
  showSearch: false,
  setShowSearch: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  showMyModels: false,
  setShowMyModels: () => {},
});

const HomePageProvider = ({ children }) => {
  const [showSearch, setShowSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyModels, setShowMyModels] = useState(true);
  return <HomePageContext.Provider value={{ showSearch, setShowSearch, searchQuery, setSearchQuery, showMyModels, setShowMyModels }}>{children}</HomePageContext.Provider>;
};

export const useHomePageContext = () => useContext(HomePageContext);
export default HomePageProvider;
