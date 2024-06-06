import { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import SysInfoModelListItem from "./SysInfoModelListItem";
import { motion, } from "framer-motion";
import MemoryChip from "../../icons/MemoryChip";
import ExternalDrive from "../../icons/ExternalDrive";

const Sysinfo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef(null);
  const hoverVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    hidden: { opacity: 1, y: 500, transition: { duration: 0.6 } },
  };

  const [selection, setSelection] = useState<'memory' | 'hard-drive'>('memory');

  const onSelectionChange = (value: 'memory' | 'hard-drive') => {
    setSelection(value);
  };

  useEffect(() => {
    const element = elementRef.current;
    const handleAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === "slideOut") {
        element.style.display = "none";
      }
    };

    element.addEventListener("animationend", handleAnimationEnd);

    return () => {
      element.removeEventListener("animationend", handleAnimationEnd);
    };
  }, []);

  useEffect(() => {
    const container = document.getElementsByClassName("sysinfo-overlay")[0];
    const scrollView = document.querySelectorAll("div.slick-slide > div")[1];
    if (!isHovered) {
      container.setAttribute("style", `display: block !important;`);
      scrollView.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [isHovered]);
  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="w-full h-full relative">
      <div className="sticky top-0">
        <div className="flex justify-between items-center mx-[8px]">
          <span className="flex">
            <MemoryChip 
              height={16} 
              width={11} 
              className={`cursor-pointer w-[16px] h-[11px] ${selection === 'memory' ? 'fill-surface-750' : 'fill-surface-500'}`}
              onClick={() => onSelectionChange('memory')}
            />
            <div className="h-[12px] w-[0.5px] bg-white/10 mx-[10px]" />
            <ExternalDrive 
              height={16} 
              width={11} 
              className={`cursor-pointer w-[16px] h-[11px] ${selection === 'hard-drive' ? 'fill-surface-750' : 'fill-surface-500'}`}
              onClick={() => onSelectionChange('hard-drive')}/>
          </span>
          <span>1/16GB</span>
        </div>
        <CircularProgressbar
          // value={usedPercentage}
          value={75}
          text={isHovered ? `75%` : ' '}
          strokeWidth={14}
          styles={buildStyles({
            textColor: "rgba(255, 255, 255, 0.75)",
            pathColor: "rgba(255, 255, 255, 1)",
            trailColor: "rgba(255, 255, 255, 0.1)",
            textSize: "12px",
            pathTransitionDuration: 0.5,
          })}
          className="h-[133px] w-[133px] mt-[14px]"
        />
      </div>
      <div className="px-[10px]">
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
        <SysInfoModelListItem />
      </div>
      <motion.div ref={elementRef} data-ishovered={isHovered} variants={hoverVariants} initial="hidden" animate={!isHovered ? "visible" : "hidden"} className="sysinfo-overlay">
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-start items-center">
          <span className="flex gap-[8px] mt-[22px]">
            <img src="/assets/icons/desktop.svg" alt="" />
            PC Memory Usage
          </span>
          <span className="sysinfo-overlay-text">
            75<p>%</p>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Sysinfo;
