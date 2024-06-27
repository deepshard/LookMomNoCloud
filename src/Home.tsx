import { useHomePageContext } from "./context/HomePageProvider";
import { useAppStore } from "./store/store";
import { useNavigate } from "react-router-dom";
import { TModel } from "./types/schemas";
import { Placeholder } from "./component/Augmentations";
import SystemInfoHardwareCarousel from "./component/SystemInfoHardwareCarousel";
import SystemInfoHardwareCarouselProvider from "./context/SystemInfoHardwareCarouselProvider";
import useModelActions from "./hooks/modelActions/useModelActions";
import Search from "./component/Search";
import FeaturedCarousel from "./component/FeaturedCarousel";
import UpdateTruffle from "./component/UpdateTruffle";
import { useEffect, useState } from "react";
import { TruffleUpdateInfo } from "./ota";
import ModelCarousel from "./component/ModelCarousel";
import AnimateModal from "./component/AnimateModal";
import AugmentationsView from "./component/AugmentationsView";
// @ts-ignore
import dayIcon from "./assets/icons/day.svg";
// @ts-ignore
import nightIcon from "./assets/icons/night.svg";
import NavBar from "./component/NavBar";


interface WelcomeInfo {
  icon: string;
  message: string;
}

export default function Home() {
  const { highlights: storeHighlights, sysInfo, updateModels } = useAppStore();
  const { installModel, runModels, stopModel, cleanupInstall, retry } = useModelActions();
  const { showSearch, setShowSearch, showAugmentations, setShowAugmentations } = useHomePageContext();
  const [updateInfo, setUpdateInfo] = useState<TruffleUpdateInfo | null>(null);
  const navigate = useNavigate();



  const handleNavigate = (model: TModel) => {
    navigate(`/model/${model.id}`, { state: { model } });
  };

  useEffect(() => {
    const handleUpdateAvailable = (newUpdateInfo: TruffleUpdateInfo) => {
      setUpdateInfo(newUpdateInfo);
    };

    const handleInitializationRequired = () => {
      navigate("/initialization");
    };

    //@ts-ignore
    window.ipc.onUpdateAvailable(handleUpdateAvailable);

    //@ts-ignore
    window.ipc.onInitializationRequired(handleInitializationRequired);

    return () => {
      //@ts-ignore
      window.ipc.onUpdateAvailable(() => {});

      //@ts-ignore
      window.ipc.onInitializationRequired(() => {});
    };
  }, []);

  const handleUpdateModelsCallback = (prevModel: TModel, newModel: Partial<TModel>, controller?: AbortController) => {
    updateModels({
      ...prevModel,
      ...newModel,
    });
    if (newModel.status === "RUNNING" && controller) {
      controller.abort();
    }
  };

  const installModelHandler = (model: TModel) => {
    installModel(model, undefined, (progress) => {
      handleUpdateModelsCallback(model, progress);
    });
  };

  const runModelsHandler = (model: TModel) => {
    runModels([model], undefined, (updatedModel, controller) => {
      handleUpdateModelsCallback(model, updatedModel, controller);
    });
  };

  const stopModelHandler = (model: TModel) => {
    stopModel(model).then((_) => {
      handleUpdateModelsCallback(model, { status: "STOPPED" });
    });
  };

  const cleanupInstallHandler = (model: TModel) => {
    cleanupInstall(model);
  };

  const retryHandler = (model: TModel) => {
    if (model.status === "NOT_DOWNLOADED" || model.status === "STOPPED") {
      model = { ...model, progress: 0, error: undefined };
      retry(model, (updateModel) => {
        handleUpdateModelsCallback(model, updateModel);
      });
    } else {
      retry(model, () => retryHandler(model));
    }
  };

  const getWelcomeInfo = (): WelcomeInfo => {
    // If local time is between 5:00 and 11:59, return morning message
    // If local time is between 12:00 and 19:59, return afternoon message
    // If local time is between 20:00 and 4:59, return evening message
    const date = new Date();
    const hours = date.getHours();
    if (hours >= 5 && hours < 12) {
      return {
        icon: dayIcon,
        message: "Good morning!",
      };
    } else if (hours >= 12 && hours < 20) {
      return {
        icon: dayIcon,
        message: "Good afternoon",
      };
    } else {
      return {
        icon: nightIcon,
        message: "Good evening",
      };
    }
  };

  return (
    <>
      <NavBar />

      <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center ">
          <div className="flex items-center gap-1.5 w-[660px] mb-[20px]">
            <img src={getWelcomeInfo().icon} alt="day" className="w-5 h-5 text-surface-400" />
            <p className="text-surface-main">{getWelcomeInfo().message}</p>
          </div>
        <div className="w-[660px] flex flex-col justify-center items-center  gap-[20px]">
          <ModelCarousel
            models={storeHighlights}
            isLoading={storeHighlights.length === 0}
            installModel={installModelHandler}
            runModels={runModelsHandler}
            stopModel={stopModelHandler}
            cleanupInstall={cleanupInstallHandler}
            onModelClick={handleNavigate}
            onRetry={retryHandler}
          />

          <div className="grid grid-cols-2 gap-5 lg:gap-5 w-auto max-w-[660px] items-center justify-center">
            <div className="col-span-1 flex flex-col gap-5 justify-between w-80">
              <FeaturedCarousel />

                <div className="w-full flex justify-between gap-5">
                  <Placeholder />
                </div>
              </div>
              <SystemInfoHardwareCarouselProvider>
                <SystemInfoHardwareCarousel sysInfo={sysInfo} />
              </SystemInfoHardwareCarouselProvider>
            </div>
          </div>
        </div>

      <AnimateModal show={showSearch || showAugmentations} onClose={() => {
        setShowAugmentations(false);
        setShowSearch(false);
        }}>
       {showSearch && <Search onModelClick={handleNavigate} />}
        {showAugmentations && <AugmentationsView />}
      </AnimateModal>
      {updateInfo && <UpdateTruffle className="fixed bottom-5 left-5" onClick={() => navigate(`/update`)} />}
    </>
  );
}
