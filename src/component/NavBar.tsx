import React from "react";

const NavBar = () => {
  return (
    <div className="navbar">
      <img src="/assets/icons/TRUFFLE_LOGO.svg" alt="its all truffle" />
      <div className="flex-center-y gap-2">
        <h1 className="h3-bold">09:30</h1>
        <div className="h-[14px] w-[1px] bg-white opacity-[0.4]" />
        <div className="small-regular opacity-[0.4]">
          <p>3 New Updates</p>
          <p>View all</p>
        </div>
      </div>
      <div className="bg-[#3b3838] opacity-[0.2] w-[490.07px] h-[29.62px] rounded-md flex-center-y px-3">
        <img src="/assets/icons/search-icon.svg" alt="search" className="w-3 h-3 mr-2" />
        <input type="text" placeholder="Search AI..." className="w-full bg-transparent outline-none base-medium" />
      </div>

      <div className="bg-red-200 h-5 w-5 rounded-full" />
    </div>
  );
};

export default NavBar;
