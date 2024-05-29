import React, { useEffect } from "react";
import ProgressBar from "./common/ProgressBar";
import SysInfoModelComponent from "./SysInfoModelComponent";
import { useStore } from "../store/store";

const SysInfo = () => {
  const { sysInfo } = useStore();

  const calculateMemoryStorageUsage = () => {
    if (!sysInfo) return { memoryUsed: 0, storageUsed: 0 };
    const memoryUsed = ((sysInfo?.resources.total.ram - sysInfo?.resources.available.ram) / sysInfo?.resources.total.ram) * 100;
    const storageUsed = ((sysInfo?.resources.total.disk - sysInfo?.resources.available.disk) / sysInfo?.resources.total.disk) * 100;
    return { memoryUsed, storageUsed };
  };

  return (
    <div className=" w-full h-full px-[18px] py-[14px]">
      <span className="flex justify-between mb-[14px]">
        <p className="base-regular">{sysInfo?.os}</p>
        <p className="base-regular text-[10px]">
          1 app • {sysInfo?.resources.models.length} model{sysInfo?.resources.models.length > 1 ? "s" : ""}
        </p>
      </span>
      <div className="w-full">
        <div className="w-full h-[26px] flex items-center rounded-[12px] relative mb-[14px]">
          <ProgressBar progress={calculateMemoryStorageUsage().memoryUsed} />
          <p className="absolute right-0 base-regular pr-[9px] mb-[2px] text-[#A7A7A7]  mix-blend-difference">Memory</p>
        </div>
        <div className="w-full h-[26px] flex items-center rounded-[12px] relative">
          <ProgressBar progress={calculateMemoryStorageUsage().storageUsed} />
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
