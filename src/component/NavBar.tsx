import { useHomePageContext } from "../context/HomePageProvider";
// @ts-ignore
import discoverVid from "../assets/videos/discover-vid.mp4";
// @ts-ignore
import searchIcon from "../assets/icons/search-icon.svg";
// @ts-ignore
import gearIcon from "../assets/icons/gear.svg";
import { useAppStore } from "../store/store";
import RunningModelsPill from "./RunningModelsPill";
import Tooltip from "./common/Tooltip";
import RunningModelsDropDown from "./RunningModelsPill/RunningModelsDropDown";

const NavBar = () => {
  const { setShowSearch, showSearch, showAugmentations, setShowDiscover, showSettings, setShowSettings } = useHomePageContext();
  const { sysInfo } = useAppStore();
  return (
    <>
      {!(showSearch || showAugmentations || showSettings) && (
        <div className="navbar">
          <div className="draggable-nav absolute top-0 left-0 right-0 h-[20px] bg-transparent z-10" />

          <div className="bg-transparent h-5 w-5 rounded-full" />

          <div className="flex w-full max-w-[740px] gap-3 justify-start items-center">
            <div
              className="flex items-center gap-[6px] cursor-pointer"
              onClick={() => {
                setShowDiscover(true);
                setShowSearch(true);
              }}>
              <video autoPlay loop muted className="aspect-square w-[18px] object-cover rounded-full saturate-0 brightness-125">
                <source src={discoverVid} type="video/mp4" />
              </video>

              <p className="text-[16px] text-surface-750 hover:text-surface-500">Discover</p>
            </div>

            <div className="h-[18px] w-[0.5px] bg-white/20" />

            <div className="h-8 flex-grow flex-center-y gap-1.5 items-center" onClick={() => setShowSearch(true)}>
              <img src={searchIcon} alt="search" className="w-3 h-3 text-surface-400" />
              <div className="flex-grow bg-transparent outline-none base-medium cursor-text">
                <p className="text-[16px] text-surface-400">Search AI...</p>
              </div>
            </div>
          </div>

          <div className="flex-center gap-4">
            {(sysInfo?.resources.models && sysInfo?.resources.models.length > 0 && sysInfo?.resources.models.every((model) => model.title)) && (
              <Tooltip
                // open={showRunningModelDropDown}
                placement="bottomRight"
                arrow={false}
                title={<RunningModelsDropDown models={sysInfo?.resources.models || []}/>}
              >
                <RunningModelsPill className="absolute right-[50px]" models={sysInfo?.resources.models || []} />
              </Tooltip>
            )}
            <img src={gearIcon} className="w-5 h-5 rounded-full cursor-pointer" onClick={() => setShowSettings(true)} />
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
