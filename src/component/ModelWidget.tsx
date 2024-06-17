import { useEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TModel } from "../types/schemas";
import { motion } from "framer-motion"

interface ModelWidgetProps extends React.HTMLAttributes<HTMLDivElement>  {
  model: TModel;
  type?: 'regular' | 'my-model';
  onInstall?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  onDelete?: () => void;
  onDisconnect?: () => void;
}

const ModelWidget = ({ model, type='regular', onInstall, onRun, onStop, onDelete, onDisconnect, className, ...props }: ModelWidgetProps) => {
  const downloadIcon = process.env.NODE_ENV === "development" ? "/assets/icons/download-fill.svg" : "../../renderer/main_window/assets/icons/download-fill.svg";
  const playIcon = process.env.NODE_ENV === "development" ? "/assets/icons/play.svg" : "../../renderer/main_window/assets/icons/play.svg";
  const pauseIcon = process.env.NODE_ENV === "development" ? "/assets/icons/pause.svg" : "../../renderer/main_window/assets/icons/pause.svg";
  const installIcon = process.env.NODE_ENV === "development" ? "/assets/icons/install.svg" : "../../renderer/main_window/assets/icons/install.svg";

  useEffect(() => {
    return () => {
      onDisconnect && onDisconnect();
    };
  }, []);

  const handleAction = () => {
    switch (model.status) {
      case "NOT_DOWNLOADED":
        onInstall && onInstall();
        break;
      case "RUNNING":
        onStop && onStop();
        break;
      case "STOPPED":
        onRun && onRun();
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
          <div 
            onClick={handleAction}
            className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full"
          >
            <img src={pauseIcon} alt="" className="h-[32.73px] w-[32.73px]" />
          </div>
        );

      default:
        break;
    }
  };

  if(model.error) {
    return (
      <div className="model-widget base-regular" {...props}>
        <p className="opacity-75">"To-do: Error design goes here"</p>
      </div>
    )
  }

  if(type === 'my-model') {
    return (
      <div className={`model-my-models base-regular ${className}`} {...props}>
        <img src={model.background_image} alt="" className="w-full min-h-[78px] rounded-sm"/>
        <p className="callout-regular text-surface-main w-full text-center mt-[11px]">{model.title}</p>
      </div>
    )
  }

  return (
    <div className={`model-widget base-regular ${className}`} {...props}>
      <img src={model.background_image} alt="" className="w-full h-full"/>
      <div className="absolute top-0 left-0 p-2">
        <p className="title-sm text-surface-main w-[60%]">{model.title}</p>
        <p className="title-sm text-surface-main w-[60%]">{model.author}</p>
      </div>
      <p className="title-sm text-surface-750 absolute bottom-0 left-0 p-2"></p>
      {getWidgetButton()}
    </div>
  );
};

export default ModelWidget;
