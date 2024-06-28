import { Progress } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";
// @ts-ignore
import errorIcon from "../../assets/icons/error.svg";
import Button from "../../component/common/Button";
import { TModel, TSysInfo } from "../../types/schemas";
import useModelActions from "../../hooks/modelActions/useModelActions";

interface UpdateProgressProps {
  sysInfo: TSysInfo | null;
  updateModels: (model: TModel) => void;
}

const UpdateProgress = ({ sysInfo, updateModels }: UpdateProgressProps) => {
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState("");
  const {stopModel} = useModelActions();

  useEffect(() => {
    const handleProgress = (value: { progress: number; bytes: number; totalBytes: number }) => {
      setPercent(value.progress * 100);
    };
    //@ts-ignore
    window.ipc.onDownloadUpdateProgress(handleProgress);

    //@ts-ignore
    window.ipc.onError((error) => setError(error));

    //@ts-ignore
    window.ipc.onUpdateDownloaded(() => setPercent(100));

    setTimeout(() => {
      // Kill all currently running models
      sysInfo?.resources.models.forEach((model) => {
        stopModelHandler(model);
      });

      //@ts-ignore
      window.ipc.downloadUpdate();
    }, 600);

    return () => {
      //@ts-ignore
      window.ipc.onDownloadUpdateProgress(() => {});

      //@ts-ignore
      window.ipc.onError(() => {});

      //@ts-ignore
      window.ipc.onUpdateDownloaded(() => {});
    };
  }, []);

  const stopModelHandler = (model: TModel) => {
    stopModel(model).then((_) => {
      updateModels({
        ...model,
        status: "STOPPED",
      });
    });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-center flex-col w-[271px]">
      <img src={truffleHardwareLandscapeIcon} alt="" className="w-[327px] h-[187px] blur-[0.4px]" />
      {error ? (
        <div className="flex justify-center items-center gap-2 mt-[81px]">
          <img src={errorIcon} alt="" />
          <p className="text-white text-center text-sm">An error occurred. Please restart the app</p>
        </div>
      ) : (
        <>
          <p className="text-white text-center text-sm mt-[81px]">Updating Truffle...</p>
          {percent < 100 && <Progress className="mt-[30px]" type="line" percent={percent} showInfo={false} />}
        </>
      )}
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
