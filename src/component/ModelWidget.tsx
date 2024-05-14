import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ModelWidget = () => {
  return (
    <div className="model-widget base-regular">
      <img src="/assets/images/llama1.png" alt="" />
      <div className="absolute top-0 left-0 p-2">
        <p className="">Llama-3</p>
        <p className="opacity-75">Meta • 7B</p>
      </div>
      <div className="h-[32.73px] w-[32.73px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
        <CircularProgressbar value={30} text="30%" styles={{ path: { stroke: "#00C920" }, text: { fill: "#00C920" } }} />
      </div>
    </div>
  );
};

export default ModelWidget;
