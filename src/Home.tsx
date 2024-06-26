import { useHomePageContext } from "./context/HomePageProvider";
import { useAppStore } from "./store/store";
import { useNavigate } from "react-router-dom";
import { TModel } from "./types/schemas";
import SystemInfoHardwareCarousel from "./component/SystemInfoHardwareCarousel";
import SystemInfoHardwareCarouselProvider from "./context/SystemInfoHardwareCarouselProvider";
import useModelActions from "./hooks/modelActions/useModelActions";
import Search from "./component/Search";
import MyModels from "./component/MyModels";
import FeaturedCarousel from "./component/FeaturedCarousel";
import ModelCarousel from "./component/ModelCarousel";
import AnimateModal from "./component/AnimateModal";

interface WelcomeInfo {
  icon: string;
  message: string;
}

export default function Home() {
  const { highlights: storeHighlights, sysInfo, downloads, updateModels } = useAppStore();
  const { installModel, runModels, stopModel, cleanupInstall } = useModelActions();
  const { showSearch, setShowSearch, showMyModels, setShowMyModels } = useHomePageContext();
  const navigate = useNavigate();

  const handleNavigate = (model: TModel) => {
    navigate(`/model/${model.id}`, { state: { model } });
  };

  const handleMyModelClick = (model: TModel) => {
    handleNavigate(model);
    setShowMyModels(false);
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

  const getWelcomeInfo = (): WelcomeInfo => {
    // If local time is between 5:00 and 11:59, return morning message
    // If local time is between 12:00 and 19:59, return afternoon message
    // If local time is between 20:00 and 4:59, return evening message
    const date = new Date();
    const hours = date.getHours();
    if (hours >= 5 && hours < 12) {
      return {
        icon: "/src/assets/icons/day.svg",
        message: "Good morning!",
      };
    } else if (hours >= 12 && hours < 20) {
      return {
        icon: "/src/assets/icons/day.svg",
        message: "Good afternoon",
      };
    } else {
      return {
        icon: "/src/assets/icons/night.svg",
        message: "Good evening",
      };
    }
  };

  return (
    <>
      <div className="snap-y snap-mandatory">
        <div className="w-full h-full flex flex-col justify-between items-center gap-5 p-14">
          <div className="w-[660px] flex flex-col justify-start items-center gap-5">
            <div className="flex justify-start items-center gap-1.5 w-full">
              <img src={getWelcomeInfo().icon} alt="day" className="w-5 h-5 text-surface-400" />
              <p className="text-surface-main">{getWelcomeInfo().message}</p>
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
      <AnimateModal show={true} onClose={() => setShowSearch(false)}>
        <Search recentlyUsedModels={storeHighlights} onModelClick={handleNavigate} />
      </AnimateModal>
      <AnimateModal show={showMyModels} onClose={() => setShowMyModels(false)}>
        <MyModels myModels={Object.values(downloads)} onModelClick={handleMyModelClick} />
      </AnimateModal>
    </>
  );
}
