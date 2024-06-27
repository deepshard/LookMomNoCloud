import { Dispatch, createContext, useContext, useState } from "react";

interface HomePageContextProps {
  showSearch: boolean;
  setShowSearch: Dispatch<React.SetStateAction<boolean>>;
  showAugmentations: boolean;
  setShowAugmentations: Dispatch<React.SetStateAction<boolean>>;
  showDiscover: boolean;
  setShowDiscover: Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<React.SetStateAction<string>>;
  showMyModels: boolean;
  setShowMyModels: Dispatch<React.SetStateAction<boolean>>;
}

const HomePageContext = createContext<HomePageContextProps>({
  showSearch: false,
  setShowSearch: () => {},
  showAugmentations: false,
  setShowAugmentations: () => {},
  showDiscover: false,
  setShowDiscover: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  showMyModels: false,
  setShowMyModels: () => {},
});

const HomePageProvider = ({ children }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyModels, setShowMyModels] = useState(false);
  const [showAugmentations, setShowAugmentations] = useState(false);
  return <HomePageContext.Provider value={{ showSearch, setShowSearch,  showDiscover, setShowDiscover,searchQuery, setSearchQuery, showMyModels, setShowMyModels, showAugmentations, setShowAugmentations }}>{children}</HomePageContext.Provider>;
};

export const useHomePageContext = () => useContext(HomePageContext);
export default HomePageProvider;
