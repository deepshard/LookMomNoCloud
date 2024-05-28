import React, { useEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TModel } from "../types/schemas";
import useInstallModel from "../hooks/useInstallModel";

interface ModelWidgetProps {
  model: TModel;
}

const ModelWidget = ({ model, }: ModelWidgetProps) => {
  const downloadIcon = process.env.NODE_ENV === "development" ? "/assets/icons/download-fill.svg" : "../../renderer/main_window/assets/icons/download-fill.svg";
  const playIcon = process.env.NODE_ENV === "development" ? "/assets/icons/play.svg" : "../../renderer/main_window/assets/icons/play.svg";
  const pauseIcon = process.env.NODE_ENV === "development" ? "/assets/icons/pause.svg" : "../../renderer/main_window/assets/icons/pause.svg";
  const llamaIcon = process.env.NODE_ENV === "development" ? "/assets/images/llama1.png" : "../../renderer/main_window/assets/images/llama1.png";

  const {installModel, disconnect} = useInstallModel();

  useEffect(() => {
    return () => {
      disconnect();
    }
  }, [])

  const handleAction = () => {
    switch (model.status) {
      case "DOWNLOADING":
        console.log("TODO: downloading");
        break;
      case "NOT_INSTALLED":
        console.log("TODO: not-installed");
        installModel(model);
        break;
      case "RUNNING":
        console.log("TODO: running");
        break;
      case "STOPPED":
        console.log("TODO: stopped");
        break;
      default:
        break;
    }
  }




  const getWidgetButton = () => {
    switch (model.status) {
      case "DOWNLOADING":
        return (
          <div className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <CircularProgressbar
              value={model.progress}
              text={`${model.progress}%`}
              styles={{
                path: { stroke: "#00C920" },
                text: { fill: "#00C920" },
              }}
            />
          </div>
        );
      case "NOT_INSTALLED":
        return (
          <div
            onClick={() => {
              handleAction();
            }}
            className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full"
          >
            <img
              src={downloadIcon}
              alt=""
              className="h-[32.73px] w-[32.73px]"
            />
          </div>
        );
      case "STOPPED":
        return (
          <div className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
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

  return (
    <div className="model-widget base-regular">
      <img src={llamaIcon} alt="" />
      <div className="absolute top-0 left-0 p-2">
        <p className="">{model.name}</p>
        <p className="opacity-75 w-[60%]">{model.author}</p>
      </div>
      <p className="opacity-75 absolute bottom-0 left-0 p-2"></p>
      {getWidgetButton()}
    </div>
  );
};

export default ModelWidget;
