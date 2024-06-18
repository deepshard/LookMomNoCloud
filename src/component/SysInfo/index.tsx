import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import SysInfoModelListItem from "./SysInfoModelListItem";
import MemoryChip from "../../icons/MemoryChip";
import ExternalDrive from "../../icons/ExternalDrive";
import { TSysInfo } from "../../types/schemas";
import { bytesToHumanReadable } from "../../utils/sysUtils";
import { useSystemInfoHardwareCarouselContext } from "../../context/SystemInfoHardwareCarouselProvider";
import { useEffect, useRef, useState } from "react";

interface SysInfoProps {
  sysInfo: TSysInfo | null;
}

const Sysinfo = ({ sysInfo }: SysInfoProps) => {
  const defaultListItemContainerHeight = 175;
  const { selection, setSelection } = useSystemInfoHardwareCarouselContext();
  const [listItemContainerHeight, setListItemContainerHeight] = useState(defaultListItemContainerHeight);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0) {
      setListItemContainerHeight(defaultListItemContainerHeight);
      return;
    }

    const MAX_DISTANCE_FROM_BOTTOM = e.currentTarget.scrollHeight - e.currentTarget.clientHeight;
    const distanceFromBottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop - e.currentTarget.clientHeight;

    const scalingPct = 1 - 0.4 * (1 - distanceFromBottom / MAX_DISTANCE_FROM_BOTTOM);
    const newHeight = Math.floor(defaultListItemContainerHeight * scalingPct);
    setListItemContainerHeight(newHeight);
  };

  useEffect(() => {
    setTimeout(() => {
      const progressBar = document.getElementsByClassName("CircularProgressbar")[0];
      // @ts-ignore
      progressBar.style.transform = 'rotate(-90deg)';
      const percentText = progressBar.getElementsByTagName("text")[0];
      percentText.style.transform = 'rotate(89deg)';
      percentText.setAttribute('x', '50');
      percentText.setAttribute('y', '-50');
    }, 100);
  }, []);

  if (!sysInfo) return null;

  return (
    <div onScroll={handleScroll} className="sys-info-model-list-container w-full h-full relative overflow-y-auto">
      <div className="sticky top-0 px-[16px] pt-[16px] w-full z-10">
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
            {bytesToHumanReadable(getUsed())}/{bytesToHumanReadable(sysInfo.resources.total[selection === "memory" ? "ram" : "disk"])}
          </span>
        </div>
      </div>
      <div className={`h-[${defaultListItemContainerHeight}px] mt-[40px] sticky top-[80px] w-full flex items-center`}>
        <div className={`w-full`} style={{ height: `${listItemContainerHeight}px` }}>
          <CircularProgressbar
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
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black from-[18%] to-transparent to-50%" />
      <div className="px-[16px] relative flex flex-col gap-[8px]">
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
      </div>
    </div>
  );
};

export default Sysinfo;
