import { Progress } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const UpdateProgress = () => {
    const [percent, setPercent] = useState(0);

    useEffect(() => {
        if(percent < 100) {
            setTimeout(() => {
                setPercent(percent + 1);
            }, 100);
        } else {
            console.log('done. Restarting Truffle Desktop...');
            // TODO: Restart Truffle Desktop
        }
    }, [percent])
  return (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-center flex-col w-[271px]">
      <img src="/src/assets/icons/truffle-hardware-landscape.svg" alt="" className="w-[327px] h-[187px] blur-[0.4px]" />
      <p className="text-white text-center text-sm mt-[81px]">Updating Truffle...</p>
      <Progress className="mt-[30px]" type="line" percent={percent} />
    </motion.div>
  );
};

export default UpdateProgress;
