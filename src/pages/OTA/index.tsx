import React from "react";
import UpdateInfo from "./UpdateInfo";
import UpdateProgress from "./UpdateProgress";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import InitializationProgress from "./InitializationProgress";

interface OTAProps {
  initialization: boolean;
}

const OTA = ({ initialization }: OTAProps) => {
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
      <AnimatePresence>{startUpdate ? <UpdateProgress /> : <UpdateInfo onConfirm={() => setStartUpdate(true)} onCancel={() => navigate(-1)} />}</AnimatePresence>
    </div>
  );
};

export default OTA;
