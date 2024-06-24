import React from "react";
import UpdateInfo from "./UpdateInfo";
import UpdateProgress from "./UpdateProgress";
import { AnimatePresence, motion } from "framer-motion";

const OTA = () => {
  const [startUpdate, setStartUpdate] = React.useState(false);
  return (
    <div className="update">
      <AnimatePresence>{startUpdate ? <UpdateProgress /> : <UpdateInfo onConfirm={() => setStartUpdate(true)} onCancel={() => {}} />}</AnimatePresence>
    </div>
  );
};

export default OTA;
