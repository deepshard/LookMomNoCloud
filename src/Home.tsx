import ModelWidget from "./component/ModelWidget";
import { useGetHighlights } from "./lib/react-query/queriesAndMutations";
import { useEffect } from "react";

import Carousel from "./component/Carousel/Carousel";
import { useAppStore, useStore } from "./store/store";
import SystemInfoHardwareCarousel from "./component/SystemInfoHardwareCarousel";
import SystemInfoHardwareCarouselProvider from "./context/SystemInfoHardwareCarouselProvider";
import useModelActions from "./hooks/modelActions/useModelActions";
import { startInstallModel } from "./api/model";

export default function Home() {
  const llamaImage = process.env.NODE_ENV === "development" ? "/assets/images/llama1.png" : "../../renderer/main_window/assets/images/llama1.png";

  const { data: highlights } = useGetHighlights();
  const { highlights: storeHighlights, setHighlights, sysInfo } = useAppStore();
  const { updateModels } = useStore();
  const { installModel, runModels, stopModel, deleteModel, cleanupInstall } = useModelActions();

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

          <div className="flex gap-1.5 w-[660px]">
            {storeHighlights?.map((model) => (
              <ModelWidget
                model={model}
                key={model.id}
                onInstall={() => {
                  installModel(model, undefined, (progress) => {
                    updateModels({
                      ...model,
                      ...progress,
                    });
                  });
                }}
                onRun={() => runModels([model], undefined, (updatedModel, controller) => {
                  updateModels({
                    ...model,
                    ...updatedModel,
                  });
                  if(updatedModel.status === 'RUNNING') {
                    controller.abort();
                  }
                })}
                onStop={() => {
                  stopModel(model)
                  .then((res) => {
                    updateModels({
                      ...model,
                      status: 'STOPPED',
                    })
                  })
                }}
                onDelete={() => deleteModel(model)}
                onDisconnect={() => cleanupInstall(model)}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5 lg:gap-5 w-auto max-w-[660px] items-center justify-center">
            <div className="col-span-1 flex flex-col gap-5 justify-between w-80">
              <Carousel autoplay easing="linear" waitForAnimate className="w-80 h-[150px] widget-3d">
                <div className="w-full h-[150px] relative overflow-hidden ">
                  <div className="absolute top-0 left-0 p-5">
                    <img src={llamaImage} alt="" className="discover-model-img w-10 h-10 rounded-xs" />
                    <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main">DeepSeek</h3>
                    <p className="body-sm break-words line-clamp-2 base-regular text-surface-500">
                      lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur
                      adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur
                      elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate
                      consectetur etiam consectetur
                    </p>
                  </div>
                </div>

                <div className="w-full h-[150px] relative overflow-hidden ">
                  <div className="absolute top-0 left-0 p-5">
                    <img src={llamaImage} alt="" className="discover-model-img w-10 h-10 rounded-xs" />
                    <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main">DeepSeek</h3>
                    <p className="body-sm break-words line-clamp-2 base-regular text-surface-500">
                      lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur
                      adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur
                      elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate
                      consectetur etiam consectetur
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
            <SystemInfoHardwareCarouselProvider>
              <SystemInfoHardwareCarousel sysInfo={sysInfo} />
            </SystemInfoHardwareCarouselProvider>
          </div>
        </div>

        {/* DON'T DELETE – Meant for alignment purposes */}
        {/* <div /> */}
      </div>
    </div>
  );
}
