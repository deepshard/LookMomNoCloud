import { useEffect } from "react";
import Carousel from "../Carousel/Carousel";
import PreOrderTruffle from "../PreOrderTruffle";
import Sysinfo from "../SysInfo";
import { TSysInfo } from "../../types/schemas";
import { upperFirst } from "lodash";
import { useSystemInfoHardwareCarouselContext } from "../../context/SystemInfoHardwareCarouselProvider";

interface SystemInfoHardwareCarouselProps {
  sysInfo: TSysInfo | null;
}
const SystemInfoHardwareCarousel = ({ sysInfo }: SystemInfoHardwareCarouselProps) => {
  const { selection } = useSystemInfoHardwareCarouselContext();

  useEffect(() => {
    const slickList = document.querySelectorAll(".slick-list")[1];
    // const slickListDiv = slickList.querySelectorAll('.slick-slide')
    // console.log(slickListDiv)
    if (slickList) {
      //   slickList.style.overflow = `visible`
    }
  }, []);

  return (
    <div className="relative">
      <Carousel easing="linear" waitForAnimate className="w-80 h-80 widget-3d">
        <Sysinfo sysInfo={sysInfo} />
        <PreOrderTruffle />
      </Carousel>
      <span className="absolute flex gap-[4px] bottom-[-35px] translate-x-[-50%] left-[50%]">
        <img src="/assets/icons/monitor.svg" alt="" />
        <p>{upperFirst(selection)} Usage</p>
      </span>
    </div>
  );
};

export default SystemInfoHardwareCarousel;
