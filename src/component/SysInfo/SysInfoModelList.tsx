import React from "react";
import SysInfoModelListItem from "../SysInfo2/SysInfoModelListItem";

function SysInfoModelsList() {
  const sysInfoTemporary = {
    resources: {
      models: [
        { id: "1", ram: 1024, disk: 2048 },
        { id: "2", ram: 2048, disk: 4096 },
        { id: "3", ram: 4096, disk: 8192 },
      ],
    },
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {sysInfoTemporary.resources.models.map((model) => (
        // Should contain model id – like this:
        // <SysInfoModelComponent key={model.id} model={model} />
        <SysInfoModelListItem />
      ))}
    </div>
  );
}

export default SysInfoModelsList;
