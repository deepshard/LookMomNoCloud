import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import SysInfoModelListItem from "./SysInfoModelListItem";
import MemoryChip from "../../icons/MemoryChip";
import ExternalDrive from "../../icons/ExternalDrive";
import { TSysInfo } from "../../types/schemas";
import { bytesToHumanReadable, roundTo } from "../../utils/sysUtils";
import { useSystemInfoHardwareCarouselContext } from "../../context/SystemInfoHardwareCarouselProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import {motion} from "framer-motion"

interface SysInfoProps {
  sysInfo: TSysInfo | null;
}

const Sysinfo = ({ sysInfo }: SysInfoProps) => {
  const defaultProgressBarContainerHeight = 175;
  const { selection, setSelection } = useSystemInfoHardwareCarouselContext();
  const [progressBarOpacity, setProgressBarOpacity] = useState(1);
  const [progressBarScale, setProgressBarScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewRef = useRef<HTMLDivElement>(null);

  const PERCENTAGE_OF_VIEW_THRESHOLD = 0.30;
  const [targetPosition, setTargetPosition] = useState(0);
  const [normalizerDenominator, setNormalizerDenominator] = useState(1);

  // Scroll handler to determine the position
  const handleScroll = useCallback(() => {
    if (containerRef.current && scrollViewRef.current) {
      const scrollViewTop = scrollViewRef.current.getBoundingClientRect().top - containerRef.current.getBoundingClientRect().top;

      const currNume = Math.abs(targetPosition - scrollViewTop);
      let normalized = roundTo(currNume / normalizerDenominator, 1);
      let newScale = normalized

      if(newScale <= 0.7) {
        newScale = 0.7
      }
      
      if (scrollViewTop <= targetPosition) {
        // ScrollView top is at or has passed target position of the container height.
        normalized = 0
      }
      setProgressBarOpacity(normalized);
      setProgressBarScale(newScale);
    }
  }, [targetPosition, normalizerDenominator]);
  
  useEffect(() => {
    setTimeout(() => {
      if(containerRef.current && scrollViewRef.current) {
        const containerHeight = containerRef.current.offsetHeight;
        const scrollViewTop = scrollViewRef.current.getBoundingClientRect().top - containerRef.current.getBoundingClientRect().top;

        const targPosition = containerHeight * PERCENTAGE_OF_VIEW_THRESHOLD;
        setTargetPosition(targPosition);
        setNormalizerDenominator(Math.abs(targPosition - scrollViewTop));
      }
    }, 200);
  }, [])


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
      progressBar.style.transform = 'rotate(-90deg)';
      const percentText = progressBar.getElementsByTagName("text")[0];
      percentText.style.transform = 'rotate(89deg)';
      percentText.setAttribute('x', '50');
      percentText.setAttribute('y', '-50');
    }, 100);
  }, []);

  if (!sysInfo) return null;

  return (
    <div ref={containerRef} onScroll={handleScroll} className="sys-info-model-list-container hide-scrollbar w-full h-full relative overflow-y-auto scroll-smooth">
      <div className="sticky top-0 px-[16px] pt-[16px] w-full z-20">
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
      <div className={`h-[${defaultProgressBarContainerHeight}px] mt-[40px] sticky top-[80px] w-full flex items-center px-8`}>
        <motion.div className={`w-full relative`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: progressBarOpacity, height: defaultProgressBarContainerHeight, scale:progressBarScale, transition: { duration: 0.2 } }}>
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
          <div className="w-full h-full bg-gradient-to-t from-black to-transparent from-[1%] to-40% absolute top-0" />
        </motion.div>
      </div>
      <div ref={scrollViewRef} className="px-[16px] relative flex flex-col gap-[8px] scroll-view">
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
      </div>
    </div>
  );
};

export default Sysinfo;
