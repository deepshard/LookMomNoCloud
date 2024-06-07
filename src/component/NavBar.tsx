import React from "react";

const NavBar = () => {
  const appIcon = process.env.NODE_ENV === "development" ? "/assets/icons/TRUFFLE_LOGO.svg" : "../../renderer/main_window/assets/icons/TRUFFLE_LOGO.svg";
  const searchIcon = process.env.NODE_ENV === "development" ? "/assets/icons/search-icon.svg" : "../../renderer/main_window/assets/icons/search-icon.svg";
  return (
    <div className="navbar no-select">
      <div className="bg-transparent h-5 w-5 rounded-full" />

      <div className="flex w-full max-w-[660px] gap-3 justify-start items-center">
        <div className="flex justify-start items-center gap-1.5">
          <div
            // src={""}
            // alt="search"
            className="w-[18px] h-[18px] rounded-full object-cover bg-surface-main"
          />

          <div className="text-surface-main">Discover</div>
        </div>

        <div className="h-4 w-[0.5px] bg-surface-100" />

        <div className="h-8 flex-grow flex-center-y gap-1.5 items-center">
          <img
            src={searchIcon}
            alt="search"
            className="w-3 h-3 text-surface-400"
          />
          <input
            type="text"
            placeholder="Search AI..."
            className="flex-grow bg-transparent outline-none base-medium"
          />
        </div>
      </div>
      
      

      <div className="bg-surface-500 h-5 w-5 rounded-full" />
    </div>
  );
};

export default NavBar;
