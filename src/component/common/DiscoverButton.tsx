import React from "react";

const DiscoverButton = () => {
  const discoverLogo = process.env.NODE_ENV === "development" ? "/assets/images/discover-logo.png" : "../../../renderer/main_window/assets/images/discover-logo.png";
  const downloadIcon = process.env.NODE_ENV === "development" ? "/assets/icons/download.svg" : "../../../renderer/main_window/assets/icons/download.svg";
  return (
    <div className="flex justify-between items-center rounded-md p-[6px] gap-5 shadow-md backdrop-blur-[24px] bg-opacity-10 w-[265px]">
      <span className="flex-center gap-1.5 ">
        <img src={discoverLogo} alt="discover" className="w-[25px] h-[25px]" loading="lazy"/>
        <span>Discover</span>
      </span>
      <img src={downloadIcon} alt="" className="w-[12px] h-[12px] ml-2" />
    </div>
  );
};

export default DiscoverButton;
