import { Dispatch, createContext, useContext, useState } from "react";

interface HomePageContextProps {
    showSearch: boolean;
    setShowSearch: Dispatch<React.SetStateAction<boolean>>
}

const HomePageContext = createContext<HomePageContextProps>({
    showSearch: false,
    setShowSearch: () => {},
});

const HomePageProvider = ({ children }) => {
    const [showSearch, setShowSearch] = useState(false);
  return <HomePageContext.Provider value={{ showSearch, setShowSearch  }}>{children}</HomePageContext.Provider>;
};

export const useHomePageContext = () => useContext(HomePageContext);
export default HomePageProvider;