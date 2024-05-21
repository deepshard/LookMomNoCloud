import React from "react";

interface ProgressBarProps {
    progress: number;
    className?: string;
}
const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  return (
    <div className={`${className || "w-full h-full rounded-md bg-[#D9D9D94D] overflow-hidden "}`}>
      <div className="h-full bg-white transition-all ease-in-out delay-150" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default ProgressBar;
