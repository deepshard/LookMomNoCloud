import ModelWidget from "./component/ModelWidget";
import { useGetHighlights } from "./lib/react-query/queriesAndMutations";
import { useEffect } from "react";

import Carousel from "./component/Carousel/Carousel";
import { useAppStore, useStore } from "./store/store";
import SystemInfoHardwareCarousel from "./component/SystemInfoHardwareCarousel";
import SystemInfoHardwareCarouselProvider from "./context/SystemInfoHardwareCarouselProvider";
import useModelActions from "./hooks/modelActions/useModelActions";
import Search from "./component/Search";
import Featured from "./component/Featured";
import { useHomePageContext } from "./context/HomePageProvider";
import MyModels from "./component/MyModels";

export default function Home() {

  const { data: highlights } = useGetHighlights();
  const { highlights: storeHighlights, setHighlights, sysInfo } = useAppStore();
  const { updateModels } = useStore();
  const { installModel, runModels, stopModel, deleteModel, cleanupInstall } = useModelActions();
  const { showSearch, setShowSearch, showMyModels, setShowMyModels } = useHomePageContext();

  useEffect(() => {
    if (highlights) {
      setHighlights(highlights);
    }
  }, [highlights]);

  return (
    <>
      {showSearch && <Search onClose={() => setShowSearch(false)} recentlyUsedModels={storeHighlights} />}
      {showMyModels && <MyModels onClose={() => setShowMyModels(false)}/>}
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
                  <Featured />
                  <Featured />
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

                  <div onClick={() => setShowMyModels(true)} className="cursor-pointer flex justify-center items-center min-w-[150px] md:w-[150px] min-h-[150px] widget-3d rounded-lg relative">
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
    </>
  );
}