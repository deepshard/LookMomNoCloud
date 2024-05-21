import React, { useEffect } from "react";
import ProgressBar from "./common/ProgressBar";
import SysInfoModelComponent from "./SysInfoModelComponent";

const SysInfo = () => {
  return (
    <div className=" w-full h-full px-[18px] py-[14px]">
      <span className="flex justify-between mb-[14px]">
        <p className="base-regular">Macbook Pro</p>
        <p className="base-regular text-[10px]">1 app • 2 models | 75%</p>
      </span>
      <div className="w-full">
        <div className="w-full h-[26px] flex items-center rounded-[12px] relative mb-[14px]">
          <ProgressBar progress={95} />
          <p className="absolute right-0 base-regular pr-[9px] mb-[2px] text-[#A7A7A7]  mix-blend-difference">Disk</p>
        </div>
        <div className="w-full h-[26px] flex items-center rounded-[12px] relative">
          <ProgressBar progress={95} />
          <p className="absolute right-0 base-regular pr-[9px] mb-[2px] text-[#A7A7A7]  mix-blend-difference">Storage</p>
        </div>
      </div>
      <div>
        <SysInfoModelComponent />
        <SysInfoModelComponent />
        <SysInfoModelComponent />
      </div>
    </div>
  );
};

export default SysInfo;
