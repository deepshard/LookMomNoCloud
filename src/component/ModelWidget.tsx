import { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TModel } from '../types/schemas'
import { motion } from "framer-motion";
import { toUnitOfCount } from "../utils/sysUtils";
import ScrollingText from "./common/ScrollingText";
import Tooltip from "./common/Tooltip";

interface ModelWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  model: TModel;
  type?: "regular" | "my-model";
  onInstall?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  onDelete?: () => void;
  onDisconnect?: () => void;
}

const ModelWidget = ({ model, type = "regular", onInstall, onRun, onStop, onDelete, onDisconnect, className = "", ...props }: ModelWidgetProps) => {
  const downloadIcon = "/src/assets/icons/download-fill.svg"
  const playIcon = "/src/assets/icons/play.svg"
  const stopIcon = "/src/assets/icons/stop.svg"
  const runningIcon = "/src/assets/icons/running.svg"
  const installIcon = "/src/assets/icons/install.svg"
  const errorIcon = "/src/assets/icons/error.svg" 

  const [isHovered, setIsHovered] = useState(false);

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

  const getErrorButton = (errorMessage: string) => {
    return (
      <Tooltip overlayClassName="rounded-sm glass-3d" overlayInnerStyle={{ color: "surface-500", padding: "10px", fontSize: "12px" }} placement="bottom" color="transparent" title={errorMessage}>
        <div className={`error-icon`}>
          <img src={errorIcon} alt="errorIcon" className="w-full h-full" />
        </div>
      </Tooltip>
    );
  };

  const getWidgetButton = () => {
    switch (model.status) {
      case "DOWNLOADING":
        return (
          <motion.div
            className="h-[30px] w-[30px] absolute bottom-0 right-0 m-2 widget-3d rounded-full"
            initial={{ opacity: 0, scale: 0.8 }} // starts from invisible and scaled down
            animate={{ opacity: 1, scale: 1 }} // animate to fully visible and normal size
            transition={{ duration: 0.1, ease: "easeInOut" }} // duration and timing function
          >
            <CircularProgressbar
              value={model.progress || 0}
              text={`${model.progress}%`}
              styles={{
                path: { stroke: "rgba(255, 255, 255, 1)" },
                trail: { stroke: "rgba(255, 255, 255, 0.4)" },
                text: { fill: "rgba(255, 255, 255, 0.75)", fontSize: "25px" },
              }}
            />
          </motion.div>
        );
      case "INSTALLING":
        return (
          <div className="h-[30px] w-[30px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <img src={installIcon} alt="" className="animate-spin" />
          </div>
        );
      case "NOT_DOWNLOADED":
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className={`h-[30px] w-[30px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full transition transition-200 widget-3d ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <img src={downloadIcon} alt="" />
          </div>
        );
      case "STOPPED":
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className={`flex-center h-[30px] w-[30px] absolute bottom-[50%] translate-y-[50%] left-[50%] translate-x-[-50%] bg-[#D9D9D94D] rounded-full transition transition-200  widget-3d cursor-pointer`}>
            <img src={playIcon} alt="" />
          </div>
        );
      case "RUNNING":
        return (
          <div onClick={(e) => {
            e.stopPropagation();
            handleAction()
          }} className={`h-[30px] w-[30px] absolute transition-opacity ${isHovered ? 'bottom-[50%] translate-y-[50%] left-[50%] translate-x-[-50%]' : 'bottom-0 right-0 m-2'} widget-3d rounded-full flex-center cursor-pointer`}>
            <img src={isHovered ? stopIcon : runningIcon} alt="" className={`${isHovered ? '' : 'h-full w-full' }`} />
          </div>
        );

      default:
        break;
    }
  };

  if (type === "my-model") {
    return (
      <div className={`model-my-models base-regular ${className}`} {...props}>
        <img src={model.backgroundImage} alt="" className="w-full min-h-[78px] rounded-[13px]" />
        <p className="callout-regular text-surface-main w-full text-center mt-[11px]">{model.title}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`model-widget base-regular ${className}`} {...props} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className="absolute inset-0 bg-black/50 z-88 rounded-sm glass-3d-no-blur"></div>
        <img src={model.backgroundImage} alt="" className="w-full h-full" />
        <div className="absolute top-0 left-0 p-2 nowrap">
          <div className="relative">
            <ScrollingText className={"text-sm nowrap relative capitalize"} text={model?.name.split("/")[1]} isHovered={isHovered} />
            <div className="flex items-start gap-0.5 -mt-[6px]">
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
      {(model.status === "ACKNOWLEDGED") && (
        <div className="absolute w-[20px] h-[3px]  flex justify-center -bottom-[9px] left-[50%] translate-x-[-50%]">
          <div className="w-[20%] bg-surface-750 rounded-full animate-in-out" />
        </div>
      )}
      {model.error && getErrorButton(model.error)}
    </div>
  );
};
export default ModelWidget;
