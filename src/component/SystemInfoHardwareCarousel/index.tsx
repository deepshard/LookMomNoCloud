import Carousel from "../Carousel/Carousel";
import PreOrderTruffle from "../PreOrderTruffle";
import Sysinfo from "../SysInfo";
import { TSysInfo } from "../../types/schemas";
import { upperFirst } from "lodash";
import { useSystemInfoHardwareCarouselContext } from "../../context/SystemInfoHardwareCarouselProvider";
import { useCallback, useRef, useState } from "react";
import {motion} from 'framer-motion'

interface SystemInfoHardwareCarouselProps {
  sysInfo: TSysInfo | null;
}
const SystemInfoHardwareCarousel = ({ sysInfo }: SystemInfoHardwareCarouselProps) => {
  const { selection } = useSystemInfoHardwareCarouselContext();
  const carouselRef = useRef<any>();
  const [showUsage, setShowUsage] = useState(1);

  const next = () => {
    carouselRef.current.next();
  };

  const prev = () => {
    carouselRef.current.prev();
  };

  const handleWheel = useCallback((event) => {
    const threshold = 30;
    // Check if the horizontal scroll delta exceeds the threshold
    if (event.deltaX > threshold) {
      next();
    } else if (event.deltaX < -threshold) {
      prev();
    }
  }, []);
  return (
    <div onWheel={handleWheel} className="relative sys-info-hardware">
      <Carousel 
        ref={carouselRef} 
        beforeChange={(_, nextSlide) => {
          if(nextSlide === 0) {
            setShowUsage(1);
          } else {
            setShowUsage(0);
          }
        }} 
        easing="linear" 
        waitForAnimate 
        className="sys-info-hardware-carousel"
      >
        <Sysinfo sysInfo={sysInfo} />
        <PreOrderTruffle />
      </Carousel>
      <motion.span className="absolute flex gap-[8px] bottom-[-35px] translate-x-[-50%] left-[50%]" initial={false} animate={{ opacity: showUsage }}>
        <img src="/src/assets/icons/monitor.svg" alt="" />
        <p className="text-surface-400 text-xs">{upperFirst(selection)} Usage</p>
      </motion.span>
    </div>
  );
};

export default SystemInfoHardwareCarousel;
