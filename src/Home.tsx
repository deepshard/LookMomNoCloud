import { useHomePageContext } from "./context/HomePageProvider";
import { useAppStore } from "./store/store";
import { useNavigate } from "react-router-dom";
import SystemInfoHardwareCarousel from "./component/SystemInfoHardwareCarousel";
import SystemInfoHardwareCarouselProvider from "./context/SystemInfoHardwareCarouselProvider";
import useModelActions from "./hooks/modelActions/useModelActions";
import Search from "./component/Search";
import MyModels from "./component/MyModels";
import FeaturedCarousel from "./component/FeaturedCarousel";
import ModelCarousel from "./component/ModelCarousel";
import { TModel } from "./types/schemas";

export default function Home() {
  const { highlights: storeHighlights, sysInfo, downloads, updateModels } = useAppStore();
  const { installModel, runModels, stopModel, deleteModel, cleanupInstall } = useModelActions();
  const { showSearch, setShowSearch, showMyModels, setShowMyModels } = useHomePageContext();
  const navigate = useNavigate();

  const handleNavigate = (model: TModel) => {
    navigate(`/model/${model.id}`, { state: { model } });
  };

  const installModelHandler = (model: TModel) => {
    installModel(model, undefined, (progress) => {
      updateModels({
        ...model,
        ...progress,
      });
    });
  };

  const runModelsHandler = (model: TModel) => {
    runModels([model], undefined, (updatedModel, controller) => {
      updateModels({
        ...model,
        ...updatedModel,
      });
      if (updatedModel.status === "RUNNING") {
        controller.abort();
      }
    });
  };

  const stopModelHandler = (model: TModel) => {
    stopModel(model).then((_) => {
      updateModels({
        ...model,
        status: "STOPPED",
      });
    });
  };

  const cleanupInstallHandler = (model: TModel) => {
    cleanupInstall(model);
  };

  return (
    <>
      {showSearch && <Search onClose={() => setShowSearch(false)} recentlyUsedModels={storeHighlights} />}
      {showMyModels && <MyModels myModels={Object.values(downloads)} onClose={() => setShowMyModels(false)} />}
      <div className="snap-y snap-mandatory">
        <div className="w-full h-full flex flex-col justify-between items-center gap-5 p-14">
          <div className="w-[660px] flex flex-col justify-start items-center gap-5">
            <div className="flex w-full -mb-[3px] gap-1.5 justify-start items-center">
              <div className="h-4 w-4 rounded-full bg-surface-750" />

              <h1 className="text-surface-750 w-full">Welcome, Peter</h1>
            </div>

            <ModelCarousel
              models={storeHighlights}
              isLoading={storeHighlights.length === 0}
              installModel={installModelHandler}
              runModels={runModelsHandler}
              stopModel={stopModelHandler}
              cleanupInstall={cleanupInstallHandler}
              onModelClick={handleNavigate}
            />

            <div className="grid grid-cols-2 gap-5 lg:gap-5 w-auto max-w-[660px] items-center justify-center">
              <div className="col-span-1 flex flex-col gap-5 justify-between w-80">
                <FeaturedCarousel />

                <div className="w-full flex justify-between gap-5">
                  <div onClick={() => setShowMyModels(true)} className="cursor-pointer flex justify-center items-center w-full min-h-[150px] widget-3d rounded-lg relative">
                    <div className="grid grid-cols-4 gap-6 p-5">
                      {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-surface-100 h-[38px] w-[38px] rounded-xs"></div>
                      ))}
                    </div>
                    <p className="callout-regular text-surface-400 absolute bottom-[-35px] right-[50%] translate-x-[50%]">Models</p>
                  </div>
                </div>
              </div>
              <SystemInfoHardwareCarouselProvider>
                <SystemInfoHardwareCarousel sysInfo={sysInfo} />
              </SystemInfoHardwareCarouselProvider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
