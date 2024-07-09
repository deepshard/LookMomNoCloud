import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import SysInfoModelListItem from "./SysInfoModelListItem";
import MemoryChip from "../../icons/MemoryChip";
import ExternalDrive from "../../icons/ExternalDrive";
import { TSysInfo } from "../../types/schemas";
import { bytesToHumanReadable, roundTo } from "../../utils/sysUtils";
import { useSystemInfoHardwareCarouselContext } from "../../context/SystemInfoHardwareCarouselProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface SysInfoProps {
  sysInfo: TSysInfo | null;
}

const Sysinfo = ({ sysInfo }: SysInfoProps) => {
  const defaultProgressBarContainerHeight = 175;
  const { selection, setSelection } = useSystemInfoHardwareCarouselContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewRef = useRef<HTMLDivElement>(null);

  const onSelectionChange = (value: "memory" | "disk") => {
    setSelection(value);
  };

  const calculatePercentage = (available: number, total: number) => {
    return Math.round(((total - available) / total) * 100);
  };

  const getUsed = () => {
    if (!sysInfo) return 0;
    if (selection === "memory") {
      return sysInfo.resources.total.ram - sysInfo.resources.available.ram;
    } else {
      return sysInfo.resources.total.disk - sysInfo.resources.available.disk;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const progressBar = document.getElementsByClassName("CircularProgressbar")[0];
      // @ts-ignore
      progressBar.style.transform = "rotate(-90deg)";
      const percentText = progressBar.getElementsByTagName("text")[0];
      percentText.style.transform = "rotate(89deg)";
      percentText.setAttribute("x", "50");
      percentText.setAttribute("y", "-50");
    }, 500);
  }, []);

  if (!sysInfo) return null;

  return (
    <div ref={containerRef} className="sys-info-model-list-container hide-scrollbar w-full h-full relative overflow-y-auto scroll-smooth">
      <div className="sticky top-0 px-[16px] pt-[16px] w-full z-20 backdrop-blur-[3px] rounded-t-lg">
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
          <span>
            {bytesToHumanReadable(getUsed(), false, 0)} of {bytesToHumanReadable(sysInfo.resources.total[selection === "memory" ? "ram" : "disk"], true, 0)}
          </span>
        </div>
      </div>
      <div className={`h-[${defaultProgressBarContainerHeight}px] mt-[40px] sticky top-[80px] w-full flex items-center px-8`}>
        <motion.div
          className={`w-full relative`}
          initial={{ opacity: 1, height: defaultProgressBarContainerHeight }}
          // animate={{ opacity: progressBarOpacity, height: defaultProgressBarContainerHeight, scale: progressBarScale, transition: { duration: 0.2 } }}
          >
          <CircularProgressbar
            value={calculatePercentage(sysInfo.resources.available[selection === "memory" ? "ram" : "disk"], sysInfo.resources.total[selection === "memory" ? "ram" : "disk"])}
            text={`${calculatePercentage(sysInfo.resources.available[selection === "memory" ? "ram" : "disk"], sysInfo.resources.total[selection === "memory" ? "ram" : "disk"]).toFixed(0)}%`}
            strokeWidth={11}
            styles={buildStyles({
              textColor: "rgba(255, 255, 255, 0.75)",
              pathColor: "rgba(255, 255, 255, 0.75)",
              trailColor: "rgba(255, 255, 255, 0.1)",
              textSize: "8px",
              pathTransitionDuration: 0.5,
            })}
            className="w-full h-full"
          />
        </motion.div>
      </div>
      <div ref={scrollViewRef} className="px-[16px] relative flex flex-col gap-[8px] scroll-view">
        {sysInfo.resources.models.map((model, index) => (
          <SysInfoModelListItem
            key={index}
            selection={selection}
            model={model}
            total={{
              ram: sysInfo.resources.total.ram,
              disk: sysInfo.resources.total.disk,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Sysinfo;
