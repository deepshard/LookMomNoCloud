import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TModel } from "../types/schemas";

export type ModelWidgetState =
  | "idle"
  | "downloading"
  | "not-downloaded"
  | "running"
  | "paused";
interface ModelWidgetProps {
  model: TModel;
  downloadModel?: (model: TModel) => void;
  widgetState?: ModelWidgetState;
}
const ModelWidget = ({
  model,
  downloadModel,
  widgetState = "idle",
}: ModelWidgetProps) => {
  // const { downloadProgress } = useStore((state) => state);

  const downloadIcon =
    process.env.NODE_ENV === "development"
      ? "/assets/icons/download-fill.svg"
      : "../../renderer/main_window/assets/icons/download-fill.svg";
  const playIcon =
    process.env.NODE_ENV === "development"
      ? "/assets/icons/play.svg"
      : "../../renderer/main_window/assets/icons/play.svg";
  const pauseIcon =
    process.env.NODE_ENV === "development"
      ? "/assets/icons/pause.svg"
      : "../../renderer/main_window/assets/icons/pause.svg";
  const llamaIcon =
    process.env.NODE_ENV === "development"
      ? "/assets/images/llama1.png"
      : "../../renderer/main_window/assets/images/llama1.png";

  const getWidgetButton = () => {
    switch (widgetState) {
      case "idle":
        return;
      case "downloading":
        return (
          <div className="h-8 w-8 absolute bottom-0 right-0 m-2 bg-surface-100 rounded-full">
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
      case "not-downloaded":
        return (
          <div
            onClick={() => {
              downloadModel && downloadModel(model);
            }}
            className="h-8 w-8 absolute bottom-0 right-0 m-2 bg-surface-100 rounded-full"
          >
            <img
              src={downloadIcon}
              alt=""
              className="h-8 w-8"
            />
          </div>
        );
      case "paused":
        return (
          <div className="h-8 w-8 absolute bottom-0 right-0 m-2 bg-surface-100 rounded-full">
            <img src={playIcon} alt="" className="h-8 w-8" />
          </div>
        );
      case "running":
        return (
          <div className="h-8 w-8 absolute bottom-0 right-0 m-2 bg-surface-100 rounded-full">
            <img src={pauseIcon} alt="" className="h-8 w-8" />
          </div>
        );

      default:
        break;
    }
  };
  return (
    <div className="model-widget base-regular">
      <img src={llamaIcon} alt="" />
      <div className="absolute top-0 left-0 p-2 w-[60%]">
        <p className="text-surface-main">{model.name}</p>
        <p className="text-surface-750">{model.author}</p>
      </div>
      <p className="text-surface-750 absolute bottom-0 left-0 p-2 w-[60%]"></p>
      {getWidgetButton()}
    </div>
  );
};

export default ModelWidget;
