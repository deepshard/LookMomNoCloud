import { Progress } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";
// @ts-ignore
import errorIcon from "../../assets/icons/error.svg";

const  UNKNOWN_DEVICE = "Unsupported device: Only M1/M2 Macs and Nvidia GPUs on Linux are supported for now.";

const InitializationProgress = () => {
  const [percent, setPercent] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleProgress = (value: { progress: number; bytes: number; totalBytes: number }) => {
      setPercent(value.progress * 100);
    };

    const handleInitializationComplete = () => {
      setInitialized(true);

      // Check if there are any other updates to prompt the user about
      //@ts-ignore
      window.ipc.checkForUpdates();

      setTimeout(() => {
        navigate("/");
      }, 2500);
    };

    //@ts-ignore
    window.ipc.onDownloadUpdateProgress(handleProgress);

    //@ts-ignore
    window.ipc.onError((error) => {
      if (error === UNKNOWN_DEVICE) {
        setError("Unsupported device: Only Metal and Ubuntu with CUDA");
      } else {
        setError("An error occurred. Please restart the app");
      }
  });

    //@ts-ignore
    window.ipc.onInitializationComplete(() => handleInitializationComplete());

    return () => {
      //@ts-ignore
      window.ipc.onDownloadUpdateProgress(() => {});

      //@ts-ignore
      window.ipc.onError(() => {});

      //@ts-ignore
      window.ipc.onInitializationComplete(() => {});
    };
  }, []);

  if (initialized) {
    return (
      <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-center flex-col w-[271px]">
        <p className="text-surface-500 text-center text-sm">All set</p>
        <p className="text-white text-center text-lg mb-[66px]">Welcome to Truffle®</p>
      </motion.div>
    );
  }

  if (percent === 100) {
    return (
      <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-center flex-col w-[271px]">
        <p className="text-surface-500 text-center text-sm">Setting up Truffle. This may take a few minutes...</p>
        <p className="text-white text-center text-lg mb-[66px]">Welcome to Truffle®</p>
      </motion.div>
    );
  }

  return (
    
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-center flex-col w-[271px]">
      <p className="text-white text-center text-lg mb-[66px]">Welcome to Truffle®</p>
      <img src={truffleHardwareLandscapeIcon} alt="" className="w-[327px] h-[187px] blur-[0.4px] mb-[66px]" />
      {
        error ? (
          <div className="flex justify-center items-center gap-2 w-full">
            <img src={errorIcon} alt="" />
            <p className="text-white text-center text-sm">{error}</p>
          </div>
        ) : (
          <>
            <Progress className="mb-[73px]" type="line" percent={Number(percent.toFixed(0))} showInfo={false} />
            <p className="text-surface-500 text-center text-sm">Checking computer's firmware...</p>
          </>
        )
      }
    </motion.div>
  );
};

export default InitializationProgress;
