import { useNavigate } from "react-router-dom";
import { useHomePageContext } from "../context/HomePageProvider";
import { useEffect } from "react";

interface WelcomeInfo {
  icon: string;
  message: string
}

const NavBar = () => {
  const searchIcon = "/src/assets/icons/search-icon.svg";
  const { setShowSearch } = useHomePageContext();
  const navigate = useNavigate();

  const getWelcomeInfo = (): WelcomeInfo => {
    // If local time is between 5:00 and 11:59, return morning message
    // If local time is between 12:00 and 19:59, return afternoon message
    // If local time is between 20:00 and 4:59, return evening message
    const date = new Date();
    const hours = date.getHours();
    if (hours >= 5 && hours < 12) {
      return {
        icon: "/src/assets/icons/day.svg",
        message: "Good morning!"
      }
    } else if (hours >= 12 && hours < 20) {
      return {
        icon: "/src/assets/icons/day.svg",
        message: "Good afternoon!"
      }
    } else {
      return {
        icon: "/src/assets/icons/night.svg",
        message: "Good evening!"
      }
    }
  }

  return (
    <div className="navbar">
      <div className="bg-transparent h-5 w-5 rounded-full" />

      <div className="flex w-full max-w-[660px] gap-3 justify-start items-center">
        <div className="flex justify-start items-center gap-1.5">
          <img
            src={getWelcomeInfo().icon}
            alt="day"
            className="w-5 h-5 text-surface-400"
          />

          <div className="text-surface-main">{getWelcomeInfo().message}</div>
        </div>

        <div className="h-4 w-[0.5px] bg-surface-100" />

        <div className="h-8 flex-grow flex-center-y gap-1.5 items-center" onClick={() => setShowSearch(true)}>
          <img src={searchIcon} alt="search" className="w-3 h-3 text-surface-400" />
          <div className="flex-grow bg-transparent outline-none base-medium cursor-text">
            <p className="text-surface-400">Search AI...</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-500 h-5 w-5 rounded-full cursor-pointer" />
    </div>
  );
};

export default NavBar;
