import React from 'react';

const SkeletonModelWidget: React.FC = () => {
  return (
    <div className="animate-pulse flex-shrink-0">
      <div className="w-[130px] h-[82px] bg-gray-300 rounded-[13px]"></div>
      <div className="mt-2 w-3/4 h-4 bg-gray-300 rounded"></div>
      <div className="mt-1 w-1/2 h-3 bg-gray-300 rounded"></div>
    </div>
  );
};

export default SkeletonModelWidget;