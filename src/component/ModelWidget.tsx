import { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TModel } from "../types/schemas";
import { motion } from "framer-motion"
import { set } from "lodash";
import { useNavigate } from "react-router-dom";



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
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);


  useEffect(() => {
    return () => {
      onDisconnect && onDisconnect();
    };
  }, []);

  const formatModelSize = (size: number) => {
    if (size >= 1e12) {
      return `${(size / 1e12).toFixed(1)}T`;
    } else if (size >= 1e9) {
      return `${(size / 1e9).toFixed(1)}B`;
    } else if (size >= 1e6) {
      return `${(size / 1e6).toFixed(1)}M`;
    } else if (size >= 1e3) {
      return `${(size / 1e3).toFixed(1)}K`;
    } else {
      return `${size}B`;
    }
  }
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
            className={`h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full transition transition-200 z-[99999] widget-3d ${isHovered ? 'opacity-100' : 'opacity-0'}`}
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
    <div 
      className={`model-widget base-regular ${className}`} 
      {...props} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getWidgetButton()}
      <div className="absolute inset-0 bg-black/50 z-88 rounded-sm glass-3d-no-blur" ></div>
      <img src={model.background_image} alt="" className="w-full h-full" />
      <div className="absolute top-0 left-0 p-2 nowrap">
        <div className="relative" 
      onClick={() => navigate(`/model/${model.id}`)}
        
        >
          <div className="absolute inset-0  "></div>
          <p className="text-sm nowrap relative "><ScrollingText text={model?.name.split('/')[1]} isHovered={isHovered}/> </p>
          <div className="flex items-start"> 
          <span className="text-xs text-surface-main relative opacity-75">
            <ScrollingText text={model?.author} isHovered={isHovered} /> </span>
          <span className="text-xs text-surface-main relative opacity-75 "> • {formatModelSize(model?.size)}</span>
          </div>
        </div>
      </div>
      <p className="title-sm text-surface-750 absolute bottom-0 left-0 p-2 scroll-on-hover"></p>
    </div>
  );
};
interface ScrollingTextProps {
  text: string;
  isHovered: boolean;
}
const ScrollingText: React.FC<ScrollingTextProps> = ({ text, isHovered }) => {
  return (
    <div className={`clip-rectangle ${text.length > 11 ? 'truncate' : ''}`}>
      <div className={`scrolling-text ${isHovered && text.length > 10  ? 'scrolling' : ''}`}>
        {text}
        <style jsx>{`
          .clip-rectangle {
            overflow: hidden;
          }
          .truncate {
            width: 10ch;
          }
          .scrolling-text {
            white-space: nowrap;
            display: inline-block;
            transform: translateX(0);
            text-overflow: ellipsis; // This will add "..." when the text overflows
            overflow: hidden; // This is necessary for text-overflow to work
          }
          .scrolling {
            animation: scroll 5s ease-out infinite;
          }
          @keyframes scroll {
            0%, 100% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(-45%);
            }
          }
        `}</style>
      </div>
    </div>
  );
};
export default ModelWidget;
