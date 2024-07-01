import { useEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { TModel } from "../../types/schemas";
import { motion } from "framer-motion";
import { MODEL_PRECISION, bytesToHumanReadable, toUnitOfCount } from "../../utils/sysUtils";
import Tooltip from "../common/Tooltip";
import "./index.css";
import "react-circular-progressbar/dist/styles.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
// @ts-ignore
import downloadIcon from "../../assets/icons/download.svg";
//@ts-ignore
import playIcon from "../../assets/icons/play.svg";
//@ts-ignore
import stopIcon from "../../assets/icons/stop.svg";
//@ts-ignore
import installIcon from "../../assets/icons/install.svg";
//@ts-ignore
import errorIcon from "../../assets/icons/error.svg";
//@ts-ignore
import retryIcon from "../../assets/icons/retry.svg";

const OverlaySVG = ({ width = 128, height = 82 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 124 79" fill="none">
    <defs>
      <filter id="blur_filter" x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="25" />
      </filter>
      <linearGradient id="overlay_gradient" x1="62" y1="79" x2="61.9999" y2="2.96496e-06" gradientUnits="userSpaceOnUse">
        <stop stopOpacity="0" />
        <stop offset="0.268371" stopOpacity="0.3" />
        <stop offset="1" stopOpacity="0.5" />
      </linearGradient>
    </defs>

    <rect width="100%" height="100%" rx="13" fill="black" fillOpacity="0.2" filter="url(#blur_filter)" />

    <rect width="100%" height="100%" rx="13" fill="url(#overlay_gradient)" fillOpacity="0.8" />
  </svg>
);

interface ModelWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  model: TModel;
  disabled?: boolean;
  onInstall?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  onCleanup?: () => void;
  onRetry?: () => void;
}

const ModelWidget = ({ model, disabled = false, className = "", onInstall, onRun, onStop, onCleanup, onRetry, ...props }: ModelWidgetProps) => {
  useEffect(() => {
    return () => {
      onCleanup && onCleanup();
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

  const getModelSize = () => {
    return MODEL_PRECISION * model.size;
  };

  const calculateDownloadedSize = () => {
    const totalSize = getModelSize();
    return totalSize * ((model.progress || 0) / 100);
  };

  const getErrorContent = (errorMessage: string) => {
    return (
      <div className="w-full flex flex-col rounded-xs bg-white/20 backdrop-blur-3xl p-2.5 gap-2 justify-start items-stretch">
        <div className="flex justify-start items-center gap-1.5 text-surface-main">
          <img src={errorIcon} alt="errorIcon" className="h-3 text-error-regular" />

          <p>An Error Occurred</p>
        </div>

        {/* Divider */}
        <div className="w-full h-[0.5px] bg-surface-100" />

        <p className="body-xs text-surface-500 leading-snug">{errorMessage}</p>
      </div>
    );
  };

  const getErrorButton = (errorMessage: string) => {
    return (
      <Tooltip
        overlayClassName="bg-black/20 rounded-sm backdrop-blur-2xl min-w-[200px]"
        overlayInnerStyle={{
          color: "surface-500",
          padding: "5px",
          fontSize: "12px",
        }}
        placement="bottom"
        color="transparent"
        title={getErrorContent(errorMessage)}>
        <img src={errorIcon} alt="errorIcon" className="error-icon" />
      </Tooltip>
    );
  };

  const getWidgetButton = () => {
    if (disabled) {
      return null;
    }

    switch (model.status) {
      case "DOWNLOADING":
        return model.error ? (
          <div className="play-button">
            <img
              src={retryIcon}
              style={{ width: "17px", height: "17px" }}
              onClick={(e) => {
                e.stopPropagation();
                onRetry && onRetry();
              }}
            />
          </div>
        ) : (
          <Tooltip
            arrow={false}
            placement="bottom"
            overlay={
              <p>
                {bytesToHumanReadable(calculateDownloadedSize(), true, 0)}/{bytesToHumanReadable(getModelSize(), true, 0)}
              </p>
            }>
            <motion.div
              className="h-[30px] w-[30px] absolute bottom-0 right-0 m-2 widget-3d rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}>
              <CircularProgressbar
                value={model.progress || 0}
                text={`${model.progress}%`}
                styles={{
                  path: { stroke: "rgba(255, 255, 255, 1)" },
                  trail: { stroke: "rgba(255, 255, 255, 0.4)" },
                  text: { fill: "rgba(255, 255, 255, 0.85)", fontSize: "30px" },
                }}
              />
            </motion.div>
          </Tooltip>
        );
      case "ACKNOWLEDGED":
      case "INSTALLING":
        return (
          <div className="play-button">
            {model.error ? (
              <img
                src={retryIcon}
                alt="retryIcon"
                style={{ width: "17px", height: "17px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry && onRetry();
                }}
              />
            ) : (
              <img src={installIcon} alt="installIcon" className="animate-spin" />
            )}
          </div>
        );
      case "STOPPED":
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className="play-button">
            {model.error ? (
              <img
                src={retryIcon}
                alt="retryIcon"
                style={{ width: "17px", height: "17px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry && onRetry();
                }}
              />
            ) : (
              <img src={playIcon} alt="playIcon" />
            )}
          </div>
        );
      case "RUNNING":
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className="stop-button">
            <img src={stopIcon} alt="" className="" />
          </div>
        );
      case "NOT_DOWNLOADED":
        return (
          <>
            {model.error ? (
              <div className="play-button">
                <img
                  src={retryIcon}
                  alt="retryIcon"
                  style={{ width: "17px", height: "17px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry && onRetry();
                  }}
                />
              </div>
            ) : (
              <Tooltip
                arrow={false}
                placement="bottom"
                overlay={
                  <p>
                    {bytesToHumanReadable(getModelSize(), true, 0)}
                  </p>
                }>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction();
                  }}
                  className="install-button absolute">
                  <img src={downloadIcon} alt="" className="icon-small" />
                  <span className="text-xs nowrap relative capitalize">Install</span>
                </div>
              </Tooltip>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative" {...props}>
      {model.status === "RUNNING" && (
        <div className="glow-container">
          <div className="glow-effect"></div>
        </div>
      )}
      <div className={`model-widget base-regular ${className} relative`}>
        <LazyLoadImage
          effect="blur"
          src={model.lowresBackgroundImage ? model.lowresBackgroundImage : model.backgroundImage}
          alt=""
          className={`w-full h-full object-cover scale-110 ${disabled && "blur-md"}`}
        />

        <div
          className={`
            absolute inset-0
            h-full w-full
            ${model.status === "RUNNING" ? "bg-black/70" : "bg-black/10"}
          `}>
          <OverlaySVG />
        </div>

        <div className="absolute top-0 left-0 p-2 w-full">
          <div className="relative flex flex-col w-full">
            <div className="text-content flex flex-col overflow-hidden w-full">
              <span className="-mb-1 title-xs inline-block capitalize truncate text-surface-main leading-normal">{model?.name.split("/")[1]}</span>
              <span className="title-xs inline-block capitalize truncate text-surface-750 leading-normal">
                {toUnitOfCount(model?.size)} • {model?.author}
              </span>
            </div>
          </div>
        </div>
      </div>
      {model.error && getErrorButton(model.error)}
      {disabled && getErrorButton("This model cannot fit in either the total memory or the available storage")}
      {getWidgetButton()}
    </div>
  );
};

export default ModelWidget;
