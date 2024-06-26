import { useHomePageContext } from "../context/HomePageProvider";
// @ts-ignore
import discoverVid from '../assets/videos/discover-vid.mp4'


const NavBar = () => {
  const searchIcon = "/src/assets/icons/search-icon.svg"
  const {setShowSearch} = useHomePageContext();

  return (
    <div className="navbar">
      <div className="bg-transparent h-5 w-5 rounded-full" />

      <div className="flex w-full max-w-[660px] gap-3 justify-start items-center">
        <div className="flex items-center gap-[6px] cursor-pointer" onClick={() => setShowSearch(true)}>
          <video autoPlay loop muted className="aspect-square w-[18px] object-cover rounded-full">
            <source src={discoverVid} type="video/mp4"/>
          </video>

          <p className="text-surface-main">Discover</p>
        </div>

        <div className="h-4 w-[0.5px] bg-surface-100" />

        <div className="h-8 flex-grow flex-center-y gap-1.5 items-center" onClick={() => setShowSearch(true)}>
          <img
            src={searchIcon}
            alt="search"
            className="w-3 h-3 text-surface-400"
          />
          <div className="flex-grow bg-transparent outline-none base-medium cursor-text">
            <p className="text-surface-400">Search AI...</p>
          </div>
        </div>
      </div>
      
      

      <div className="bg-surface-500 h-5 w-5 rounded-full" />
    </div>
  );
};

export default NavBar;
