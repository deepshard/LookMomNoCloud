import { bytesToHumanReadable } from "../../utils/sysUtils";
import { TModel } from "../../types/schemas";

interface SysInfoModelListItemProps {
  model?: TModel;
  selection?: "memory" | "disk";
  total: { ram: number; disk: number };
}
function SysInfoModelListItem({ model, selection = "memory", total }: SysInfoModelListItemProps) {
  const ramOrDiskKey = selection === "memory" ? "ram" : "disk";

  const calculatePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  return (
    <>
      {model?.title && (
        <div className="sysinfo-model-item">
          <img src="/src/assets/images/llama1.png" alt="" className="w-[30px] h-[30px] rounded-xs z-10" />

          <div className="flex flex-col justify-center items-start grow z-10">
            <p className="text-surface-750 title-sm">{model.title}</p>

            <span className="flex gap-1 items-center -mt-1">
              <div className="w-1.5 h-1.5 bg-success-regular rounded-full" />
              <p className="text-surface-500 callout-sm">{bytesToHumanReadable(model[ramOrDiskKey], true, 0)}</p>
            </span>
          </div>

          <p className="pr-1 text-surface-500 z-10">{calculatePercentage(model[ramOrDiskKey], total[ramOrDiskKey])}%</p>
        </div>
      )}
    </>
  );
}

export default SysInfoModelListItem;
