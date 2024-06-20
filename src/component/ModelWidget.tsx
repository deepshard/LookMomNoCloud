import { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TModel } from "../types/schemas";
import { motion } from "framer-motion";
import { toUnitOfCount } from "../utils/sysUtils";
import ScrollingText from "./common/ScrollingText";

interface ModelWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  model: TModel;
  type?: "regular" | "my-model";
  onInstall?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  onDelete?: () => void;
  onDisconnect?: () => void;
}

const ModelWidget = ({ model, type = "regular", onInstall, onRun, onStop, onDelete, onDisconnect, className, ...props }: ModelWidgetProps) => {
  const downloadIcon = process.env.NODE_ENV === "development" ? "/assets/icons/download-fill.svg" : "../../renderer/main_window/assets/icons/download-fill.svg";
  const playIcon = process.env.NODE_ENV === "development" ? "/assets/icons/play.svg" : "../../renderer/main_window/assets/icons/play.svg";
  const pauseIcon = process.env.NODE_ENV === "development" ? "/assets/icons/pause.svg" : "../../renderer/main_window/assets/icons/pause.svg";
  const installIcon = process.env.NODE_ENV === "development" ? "/assets/icons/install.svg" : "../../renderer/main_window/assets/icons/install.svg";
  const errorIcon = process.env.NODE_ENV === "development" ? "/assets/icons/error.svg" : "../../renderer/main_window/assets/icons/error.svg";

  const [isHovered, setIsHovered] = useState(false);
  model.status = 'STOPPED'

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
      case "ACKNOWLEDGED":
        return <p>To-Do: ACKNOWLEDGED</p>;
      case "DOWNLOADING":
        return (
          <motion.div
            className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D]  z-[99999] rounded-full"
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
          <div className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] z-[99999] rounded-full">
            <img src={installIcon} alt="" className="h-[32.73px] w-[32.73px] animate-spin" />
          </div>
        );
      case "NOT_DOWNLOADED":
        return (
          <div
            onClick={() => {
              handleAction();
            }}
            className={`h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full transition transition-200 z-[99999] widget-3d ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <img src={downloadIcon} alt="" className="h-[32.73px] w-[32.73px]" />
          </div>
        );
      case "STOPPED":
        return (
          <div onClick={handleAction} className={`h-[32.73px] w-[32.73px] absolute bottom-[50%] translate-y-[50%] left-[50%] translate-x-[-50%] bg-[#D9D9D94D] rounded-full transition transition-200 z-[99999] widget-3d ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <img src={playIcon} alt="" className="h-[32.73px] w-[32.73px]" />
          </div>
        );
      case "RUNNING":
        return (
          <div onClick={handleAction} className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <img src={pauseIcon} alt="" className="h-[32.73px] w-[32.73px]" />
          </div>
        );

      default:
        break;
    }
  };

  if (model.error) {
    return (
      <div
        onClick={() => {
          handleAction();
        }}
        className={`h-[32.73px] w-[32.73px] absolute bottom-0 left-0 m-2 bg-[#D9D9D94D] rounded-full transition transition-200 z-[99999] widget-3d ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <img src={errorIcon} alt="" className="h-[32.73px] w-[32.73px]" />
      </div>
    );
  }

  if (type === "my-model") {
    return (
      <div className={`model-my-models base-regular ${className}`} {...props}>
        <img src={model.background_image} alt="" className="w-full min-h-[78px] rounded-sm" />
        <p className="callout-regular text-surface-main w-full text-center mt-[11px]">{model.title}</p>
      </div>
    );
  }

  return (
    <div className={`model-widget base-regular ${className}`} {...props} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="absolute inset-0 bg-black/50 z-88 rounded-sm glass-3d-no-blur"></div>
      <img src={model.background_image} alt="" className="w-full h-full" />
      <div className="absolute top-0 left-0 p-2 nowrap">
        <div className="relative" onClick={() => (window.location.href = `/model/${model.id}`)}>
          <ScrollingText className={"text-sm nowrap relative capitalize"} text={model?.name.split("/")[1]} isHovered={isHovered} />
          <div className="flex items-start gap-0.5">
            <span className="text-xs text-surface-main relative opacity-75">
              <ScrollingText text={toUnitOfCount(model?.size)} isHovered={isHovered} />{" "}
            </span>
            <span className="text-xs text-surface-main relative opacity-75"> • </span>
            <span className="text-xs text-surface-main relative opacity-75 capitalize"> {model?.author} </span>
          </div>
        </div>
      </div>
      <p className="title-sm text-surface-750 absolute bottom-0 left-0 p-2 scroll-on-hover"></p>
      {getWidgetButton()}
    </div>
  );
};
export default ModelWidget;
