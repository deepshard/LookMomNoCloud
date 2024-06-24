import React from 'react';
import { motion } from 'framer-motion';

const SkeletonModelWidget: React.FC = () => {
  return (
    <motion.div 
      className="flex-shrink-0"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-[130px] h-[82px] bg-gray-300 rounded-[13px]"></div>
    </motion.div>
  );
};

export default SkeletonModelWidget;