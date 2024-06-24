import React from "react";
import UpdateInfo from "./UpdateInfo";
import UpdateProgress from "./UpdateProgress";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const OTA = () => {
  const [startUpdate, setStartUpdate] = React.useState(false);
  const navigate = useNavigate()
  return (
    <div className="update">
      <AnimatePresence>{startUpdate ? <UpdateProgress /> : <UpdateInfo onConfirm={() => setStartUpdate(true)} onCancel={() => navigate(-1)} />}</AnimatePresence>
    </div>
  );
};

export default OTA;
