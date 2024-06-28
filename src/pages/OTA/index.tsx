import React from "react";
import UpdateInfo from "./UpdateInfo";
import UpdateProgress from "./UpdateProgress";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import InitializationProgress from "./InitializationProgress";
import { useAppStore } from "../../store/store";

interface OTAProps {
  initialization: boolean;
}

const OTA = ({ initialization }: OTAProps) => {
  const { sysInfo, updateModels } = useAppStore();
  const [startUpdate, setStartUpdate] = React.useState(false);
  const navigate = useNavigate();


  if (initialization) {
    return (
      <div className="update">
        <InitializationProgress />
      </div>
    );
  }

  return (
    <div className="update">
      <AnimatePresence>
        {startUpdate ? <UpdateProgress sysInfo={sysInfo} updateModels={updateModels} /> : <UpdateInfo onConfirm={() => setStartUpdate(true)} onCancel={() => navigate(-1)} />}
      </AnimatePresence>
    </div>
  );
};

export default OTA;
