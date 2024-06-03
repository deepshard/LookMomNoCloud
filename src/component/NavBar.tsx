import React from "react";

const NavBar = () => {
  const appIcon = process.env.NODE_ENV === "development" ? "/assets/icons/TRUFFLE_LOGO.svg" : "../../renderer/main_window/assets/icons/TRUFFLE_LOGO.svg";
  const searchIcon = process.env.NODE_ENV === "development" ? "/assets/icons/search-icon.svg" : "../../renderer/main_window/assets/icons/search-icon.svg";
  return (
    <div className="navbar">
      <img src={appIcon} alt="its all truffle" />
      <div className="w-[660px] h-8 rounded-sm flex-center-y px-2">
        <img
          src={searchIcon}
          alt="search"
          className="w-3 h-3 mr-2 text-surface-400"
        />
        <input
          type="text"
          placeholder="Search AI..."
          className="w-full bg-transparent outline-none base-medium body text-surface-400"
        />
      </div>

      <div className="bg-white h-5 w-5 rounded-full" />
    </div>
  );
};

export default NavBar;
