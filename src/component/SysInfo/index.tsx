import { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import SysInfoModelListItem from "./SysInfoModelListItem";
import MemoryChip from "../../icons/MemoryChip";
import ExternalDrive from "../../icons/ExternalDrive";
import { TSysInfo } from "../../types/schemas";
import {upperFirst} from 'lodash'
import { bytesToHumanReadable } from "../../utils/sysUtils";

interface SysInfoProps {
    sysInfo: TSysInfo | null;
}

const Sysinfo = ({sysInfo}: SysInfoProps) => {

  const [selection, setSelection] = useState<"memory" | "disk">("memory");

  const onSelectionChange = (value: "memory" | "disk") => {
    setSelection(value);
  };

  const calculatePercentage = (avaliable: number, total: number) => {
    return Math.round(((total - avaliable) / total) * 100);
  };

  const getUsed = () => {
    if(!sysInfo) return 0
    if(selection === "memory") {
      return sysInfo.resources.total.ram - sysInfo.resources.available.ram
    } else {
      return sysInfo.resources.total.disk - sysInfo.resources.available.disk
    }
  }


  if(!sysInfo) return null

  return (
    <div className="w-full h-full relative ">
      <div className="sticky top-0 px-[16px] pt-[16px] w-full">
        <div className="flex justify-between items-center">
          <span className="flex">
            <MemoryChip
              height={16}
              width={11}
              className={`cursor-pointer w-[16px] h-[11px] ${selection === "memory" ? "fill-surface-750" : "fill-surface-500"}`}
              onClick={() => onSelectionChange("memory")}
            />
            <div className="h-[12px] w-[0.5px] bg-white/10 mx-[10px]" />
            <ExternalDrive
              height={16}
              width={11}
              className={`cursor-pointer w-[16px] h-[11px] ${selection === "disk" ? "fill-surface-750" : "fill-surface-500"}`}
              onClick={() => onSelectionChange("disk")}
            />
          </span>
          <span>{bytesToHumanReadable(getUsed())}/{bytesToHumanReadable(sysInfo.resources.total[selection === "memory" ? "ram" : "disk"])}</span>
        </div>
      </div>
      <CircularProgressbar
        // value={usedPercentage}
        value={calculatePercentage(sysInfo.resources.available[selection === "memory" ? "ram" : "disk"], sysInfo.resources.total[selection === "memory" ? "ram" : "disk"])}
        text={`${calculatePercentage(sysInfo.resources.available[selection === "memory" ? "ram" : "disk"], sysInfo.resources.total[selection === "memory" ? "ram" : "disk"]).toFixed(0)}%`}
        strokeWidth={13}
        styles={buildStyles({
          textColor: "rgba(255, 255, 255, 0.75)",
          pathColor: "rgba(255, 255, 255, 1)",
          trailColor: "rgba(255, 255, 255, 0.1)",
          textSize: "12px",
          pathTransitionDuration: 0.5,
        })}
        className="h-[175px] w-[75px] mt-[40px]"
      />
      <div className="px-[10px]">
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
      </div>
      <span className="flex gap-[4px] absolute bottom-[-10px] z-[9999]">
        <img src="/assets/icons/monitor.svg" alt="" />
        <p>{upperFirst(selection)} Usage</p>
      </span>
    </div>
  );
};

export default Sysinfo;
