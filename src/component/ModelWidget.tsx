import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { IModel } from "src/types";
import useStore from "../store";

export type ModelWidgetState =
  | "idle"
  | "downloading"
  | "not-downloaded"
  | "running"
  | "paused";
interface ModelWidgetProps {
  model: IModel;
  downloadModel?: (model: IModel) => void;
  widgetState?: ModelWidgetState;
}
const ModelWidget = ({
  model,
  downloadModel,
  widgetState = "idle",
}: ModelWidgetProps) => {
  const { downloadProgress } = useStore((state) => state);

  const getDownloadProgress = () => {
    const modelPathName = model.hfLink.split("/").slice(3).join("/");
    if (downloadProgress[modelPathName]) {
      return downloadProgress[modelPathName];
    }
    return 0;
  };

  const getWidgetButton = () => {
    switch (widgetState) {
      case "idle":
        return;
      case "downloading":
        return (
          <div className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <CircularProgressbar
              value={getDownloadProgress()}
              text={`${getDownloadProgress()}%`}
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
            className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full"
          >
            <img
              src="/assets/icons/download.svg"
              alt=""
              className="h-[32.73px] w-[32.73px]"
            />
          </div>
        );
      case "paused":
        return (
          <div className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <img
              src="/assets/icons/play.svg"
              alt=""
              className="h-[32.73px] w-[32.73px]"
            />
          </div>
        );
      case "running":
        return (
          <div className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <img
              src="/assets/icons/pause.svg"
              alt=""
              className="h-[32.73px] w-[32.73px]"
            />
          </div>
        );

      default:
        break;
    }
  };
  return (
    <div className="model-widget base-regular">
      <img src="/assets/images/llama1.png" alt="" className="rounded-lg" />
      <div className="absolute top-0 left-0 p-2">
        <p className="">{model.title}</p>
        <p className="opacity-75 w-[60%]">{model.author}</p>
      </div>
      <p className="opacity-75 absolute bottom-0 left-0 p-2"></p>
      {getWidgetButton()}
    </div>
  );
};

export default ModelWidget;
