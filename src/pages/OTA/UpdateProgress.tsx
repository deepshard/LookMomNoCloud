import { Progress } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";
import Button from "../../component/common/Button";

const UpdateProgress = () => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const handleProgress = (value: { progress: number; bytes: number; totalBytes: number }) => {
      setPercent(value.progress * 100);
    };
    //@ts-ignore
    window.ipc.onDownloadUpdateProgress(handleProgress);

    //@ts-ignore
    window.ipc.onError((error) => console.error(error));

    //@ts-ignore
    window.ipc.onUpdateDownloaded(() => console.log("update downloaded"));

    setTimeout(() => {
      //@ts-ignore
      window.ipc.downloadUpdate();
    }, 600);

    return () => {
      //@ts-ignore
      window.ipc.onDownloadUpdateProgress(() => {});
    };
  }, []);
  return (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-center flex-col w-[271px]">
      <img src={truffleHardwareLandscapeIcon} alt="" className="w-[327px] h-[187px] blur-[0.4px]" />
      <p className="text-white text-center text-sm mt-[81px]">Updating Truffle...</p>
      <Progress className="mt-[30px]" type="line" percent={percent} showInfo={false} />
      {percent === 100 && (
        <div className="flex-center flex-col mt-[30px] gap-2">
          <p>Restart is required to complete the update</p>
          <Button
          className="!rounded-sm"
            onClick={() => {
              //@ts-ignore
              window.ipc.restartAndUpdate();
            }}>
            Restart
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default UpdateProgress;
