import { useEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TModel } from "../types/schemas";
import useInstallModel from "../hooks/installModel/useInstallModel";
import { startInstallModel } from "../api/model";
import { useStore } from "../store/store";
import { motion } from "framer-motion"

interface ModelWidgetProps {
  model: TModel;
}

const ModelWidget = ({ model }: ModelWidgetProps) => {
  const downloadIcon = process.env.NODE_ENV === "development" ? "/assets/icons/download-fill.svg" : "../../renderer/main_window/assets/icons/download-fill.svg";
  const playIcon = process.env.NODE_ENV === "development" ? "/assets/icons/play.svg" : "../../renderer/main_window/assets/icons/play.svg";
  const pauseIcon = process.env.NODE_ENV === "development" ? "/assets/icons/pause.svg" : "../../renderer/main_window/assets/icons/pause.svg";
  const llamaIcon = process.env.NODE_ENV === "development" ? "/assets/images/llama1.png" : "../../renderer/main_window/assets/images/llama1.png";
  const installIcon = process.env.NODE_ENV === "development" ? "/assets/icons/install.svg" : "../../renderer/main_window/assets/icons/install.svg";

  const { setDownloads } = useStore();
  const { installModel, disconnect } = useInstallModel({ streamFn: startInstallModel });

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const handleAction = () => {
    switch (model.status) {
      case "DOWNLOADING":
        console.log("TODO: downloading");
        break;
      case "NOT_DOWNLOADED":
        installModel(model, new AbortController(), (progress) => {
          setDownloads({
            ...model,
            ...progress,
          });
        });
        break;
      case "RUNNING":
        console.log("TODO: trying to stop");
        break;
      case "STOPPED":
        console.log("TODO: trying to run");
        break;
      default:
        break;
    }
  };

  const getWidgetButton = () => {
    switch (model.status) {
      case 'ACKNOWLEDGED':
        return (
          <p>To-Do: ACKNOWLEDGED</p>        
        )
      case "DOWNLOADING":
        return (
          <motion.div 
            className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full"
            initial={{ opacity: 0, scale: 0.8 }} // starts from invisible and scaled down
            animate={{ opacity: 1, scale: 1 }} // animate to fully visible and normal size
            transition={{ duration: 0.1, ease: "easeInOut" }} // duration and timing function
          >
            <CircularProgressbar
              value={model.progress || 0}
              text={`${model.progress}%`}
              styles={{
                path: { stroke: "#00C920" },
                text: { fill: "#00C920" },
              }}
            />
          </motion.div>
        );
      case "INSTALLING":
        return (
          <div className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <img src={installIcon} alt="" className="h-[32.73px] w-[32.73px] animate-spin" />
          </div>
        );
      case "NOT_DOWNLOADED":
        return (
          <div
            onClick={() => {
              handleAction();
            }}
            className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full"
          >
            <img src={downloadIcon} alt="" className="h-[32.73px] w-[32.73px]" />
          </div>
        );
      case "STOPPED":
        return (
          <div onClick={handleAction} className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <img src={playIcon} alt="" className="h-[32.73px] w-[32.73px]" />
          </div>
        );
      case "RUNNING":
        return (
          <div className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <img src={pauseIcon} alt="" className="h-[32.73px] w-[32.73px]" />
          </div>
        );

      default:
        break;
    }
  };

  if(model.error) {
    return (
      <div className="model-widget base-regular">
        <p className="opacity-75">"To-do: Error design goes here"</p>
      </div>
    )
  }

  return (
    <div className="model-widget base-regular">
      <img src={llamaIcon} alt="" />
      <div className="absolute top-0 left-0 p-2">
        <p className="title-sm text-surface-main w-[60%]">{model.author}</p>
      </div>
      <p className="title-sm text-surface-750 absolute bottom-0 left-0 p-2"></p>
      {getWidgetButton()}
    </div>
  );
};

export default ModelWidget;
