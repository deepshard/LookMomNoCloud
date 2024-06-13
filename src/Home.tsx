import ModelWidget from "./component/ModelWidget";
import { Button } from "antd";
import { useGetHighlights } from "./lib/react-query/queriesAndMutations";
import { useEffect } from "react";

import Carousel from "./component/Carousel/Carousel";
import SysInfo from "./component/SysInfo";
import useSysInfo from "./hooks/sysInfo/useSysInfo";
import { useAppStore } from "./store/store";

export default function Home() {
  const llamaImage = process.env.NODE_ENV === "development" ? "/assets/images/llama1.png" : "../../renderer/main_window/assets/images/llama1.png";
  const truffleHardwareImage = process.env.NODE_ENV === "development" ? "/assets/icons/truffle-hardware.svg" : "../../renderer/main_window/assets/icons/truffle-hardware.svg";

  const { data: highlights } = useGetHighlights();
  const { highlights: storeHighlights, setHighlights, sysInfo } = useAppStore();

  useEffect(() => {
    if (highlights) {
      setHighlights(highlights);
    }
  }, [highlights]);

  return (
    <div className="snap-y snap-mandatory">
      <div className="w-full h-full flex flex-col justify-between items-center gap-5 p-14">
        {/* DON'T DELETE – Meant for alignment purposes */}
        {/* <div /> */}

        <div className="w-[660px] flex flex-col justify-start items-center gap-5">
          <div className="flex w-full -mb-[3px] gap-1.5 justify-start items-center">
            <div className="h-4 w-4 rounded-full bg-surface-750" />

            <h1 className="text-surface-750 w-full">Welcome, Peter</h1>
          </div>

          <div className="flex gap-1.5 w-[660px]">{storeHighlights?.map((model) => <ModelWidget model={model} key={model.id} />)}</div>

          <div className="grid grid-cols-2 gap-5 lg:gap-5 w-auto max-w-[660px] items-center justify-center">
            <div className="col-span-1 flex flex-col gap-5 justify-between w-80">
              <Carousel autoplay easing="linear" waitForAnimate className="w-80 h-[150px] widget-3d">
                <div className="w-full h-[150px] relative overflow-hidden ">
                  <div className="absolute top-0 left-0 p-5">
                    <img
                      src={llamaImage}
                      alt=""
                      className="discover-model-img w-10 h-10 rounded-xs"
                    />
                    <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main">
                      DeepSeek
                    </h3>
                    <p className="body-sm break-words line-clamp-2 base-regular text-surface-500">
                      lorem ipsum dolor sit amet consectetur adipiscing elit
                      etiam consectetur elementum mattis aliquam vulputate
                      consectetur etiam consectetur lorem ipsum dolor sit amet
                      consectetur adipiscing elit etiam consectetur elementum
                      mattis aliquam vulputate consectetur etiam consectetur
                      lorem ipsum dolor sit amet consectetur adipiscing elit
                      etiam consectetur elementum mattis aliquam vulputate
                      consectetur etiam consectetur lorem ipsum dolor sit amet
                      consectetur adipiscing elit etiam consectetur elementum
                      mattis aliquam vulputate consectetur etiam consectetur
                    </p>
                  </div>
                </div>

                <div className="w-full h-[150px] relative overflow-hidden ">
                  <div className="absolute top-0 left-0 p-5">
                    <img
                      src={llamaImage}
                      alt=""
                      className="discover-model-img w-10 h-10 rounded-xs"
                    />
                    <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main">
                      DeepSeek
                    </h3>
                    <p className="body-sm break-words line-clamp-2 base-regular text-surface-500">
                      lorem ipsum dolor sit amet consectetur adipiscing elit
                      etiam consectetur elementum mattis aliquam vulputate
                      consectetur etiam consectetur lorem ipsum dolor sit amet
                      consectetur adipiscing elit etiam consectetur elementum
                      mattis aliquam vulputate consectetur etiam consectetur
                      lorem ipsum dolor sit amet consectetur adipiscing elit
                      etiam consectetur elementum mattis aliquam vulputate
                      consectetur etiam consectetur lorem ipsum dolor sit amet
                      consectetur adipiscing elit etiam consectetur elementum
                      mattis aliquam vulputate consectetur etiam consectetur
                    </p>
                  </div>
                </div>
              </Carousel>

              <div className="w-full flex justify-between gap-5">
                <div className="flex justify-center items-center min-w-[150px] md:w-[150px] min-h-[150px] widget-3d rounded-lg relative">
                  <div className="grid grid-cols-2 gap-5 p-5">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="bg-surface-100 h-[38px] w-[38px] rounded-xs"></div>
                    ))}
                  </div>
                  <p className="callout-regular text-surface-400 absolute bottom-[-35px] right-[50%] translate-x-[50%]">Apps</p>
                </div>

                <div className="flex justify-center items-center min-w-[150px] md:w-[150px] min-h-[150px] widget-3d rounded-lg relative">
                  <div className="grid grid-cols-2 gap-5 p-5">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="bg-surface-100 h-[38px] w-[38px] rounded-xs"></div>
                    ))}
                  </div>
                  <p className="callout-regular text-surface-400 absolute bottom-[-35px] right-[50%] translate-x-[50%]">Models</p>
                </div>
              </div>
            </div>

            {/* <div className="relative overflow-hidden widget-3d w-80 h-80">
            </div> */}
              <Carousel easing="linear" waitForAnimate className="w-80 h-80 widget-3d">
                <SysInfo sysInfo={sysInfo} />
                {/* <div className="w-full h-full">
                  <SysInfo />
                </div>

                <div className="col-span-1 w-full h-full ">
                  <div className="flex flex-col w-full h-full">
                    <div className="w-full h-full flex justify-center flex-1 ">
                      <img src={truffleHardwareImage} alt="" className="self-end" />
                    </div>
                    <div className="flex w-full h-[45%] border-t-[0.9px] border-t-white/30 radial-gradient from-[#d9d9d9]/50 from-[20%] via-[#d9d9d9]/45 via-30% to-[#D9D9D94D]/30 to-[60%]">
                      <Button type="primary" className="preorder-btn self-end m-[13px] h-[40px] w-full bg-[#817f7f] text-white">
                        <span className="base-medium ">Pre Order Truffle–1</span>
                      </Button>
                    </div>
                  </div>
                </div> */}
              </Carousel>
          </div>
        </div>

        {/* DON'T DELETE – Meant for alignment purposes */}
        {/* <div /> */}
      </div>
    </div>
  );
}
