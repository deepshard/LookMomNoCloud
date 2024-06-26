import { Progress } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";
import errorIcon from "../../assets/icons/error.svg";

const InitializationProgress = () => {
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleProgress = (value: { progress: number; bytes: number; totalBytes: number }) => {
      setPercent(value.progress * 100);

      if (value.progress === 1) {
        setTimeout(() => {
          navigate("/");
        }, 2500)
      }
    };

    //@ts-ignore
    window.ipc.onDownloadUpdateProgress(handleProgress);

    //@ts-ignore
    window.ipc.onError((error) => setError(error));

    //@ts-ignore
    window.ipc.onUpdateDownloaded(() => setPercent(100));

    return () => {
      //@ts-ignore
      window.ipc.onDownloadUpdateProgress(() => {});

      //@ts-ignore
      window.ipc.onError(() => {});

      //@ts-ignore
      window.ipc.onUpdateDownloaded(() => {});
    };
  }, []);
  return (
    <AnimatePresence>
      {
        percent == 100 ? (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-center flex-col w-[271px]">
            <p className="text-surface-500 text-center text-sm">All set</p>
            <p className="text-white text-center text-lg mb-[66px]">Welcome to Truffle®</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-center flex-col w-[271px]">
            <p className="text-white text-center text-lg mb-[66px]">Welcome to Truffle®</p>
            <img src={truffleHardwareLandscapeIcon} alt="" className="w-[327px] h-[187px] blur-[0.4px] mb-[66px]" />
            {
              error ? (
                <div className="flex justify-center items-center gap-2">
                  <img src={errorIcon} alt="" />
                  <p className="text-white text-center text-sm">An error occurred. Please restart the app</p>
                </div>
              ) : (
                <>
                  <Progress className="mb-[73px]" type="line" percent={percent} showInfo={false} />
                  <p className="text-surface-500 text-center text-sm">Checking computer's firmware...</p>
                </>
              )
            }
          </motion.div>
        )
      }
    </AnimatePresence>

  );
};

export default InitializationProgress;
