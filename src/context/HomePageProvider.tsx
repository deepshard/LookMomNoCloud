import { Dispatch, createContext, useContext, useState } from "react";

interface HomePageContextProps {
  showSearch: boolean;
  setShowSearch: Dispatch<React.SetStateAction<boolean>>;
  showMyModels: boolean;
  setShowMyModels: Dispatch<React.SetStateAction<boolean>>;
}

const HomePageContext = createContext<HomePageContextProps>({
  showSearch: false,
  setShowSearch: () => {},
  showMyModels: false,
  setShowMyModels: () => {},
});

const HomePageProvider = ({ children }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMyModels, setShowMyModels] = useState(false);
  return <HomePageContext.Provider value={{ showSearch, setShowSearch,  showMyModels, setShowMyModels }}>{children}</HomePageContext.Provider>;
};

export const useHomePageContext = () => useContext(HomePageContext);
export default HomePageProvider;
