import { TModel } from "../../types/schemas";
// @ts-ignore
import copyIcon from "../../assets/icons/copy.svg";
// @ts-ignore
import checkIcon from "../../assets/icons/checkmark.circle.svg";
import "./RunningModelsPill.css";
import Switch from "../Switch";
import { useState } from "react";

interface RunningModelsDropDownProps {
  models: TModel[];
}

const RunningModelsDropDown = ({ models }: RunningModelsDropDownProps) => {
  const [localModels, setLocalModels] = useState([...models].map((model) => ({ ...model, isRemote: false })));
  const [showCheck, setShowCheck] = useState(false);

  const toggleRemoteAccess = (model: any) => {
    const cp = [...localModels];
    const index = cp.findIndex((m) => m.id === model.id);
    cp[index].isRemote = !cp[index].isRemote;
    setLocalModels([...cp]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Optional: Notify the user that the text was copied
        // alert("Copied to clipboard!");
        setShowCheck(true);
        setTimeout(() => {
          setShowCheck(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };
  return (
    <table className="min-w-[352px] border-collapse">
      <thead>
        <tr>
          <th className="text-left">Model</th>
          <th className="text-right text-nowrap">Remote Access</th>
        </tr>
      </thead>
      <tbody>
        {localModels.map((model) => (
          <tr key={model.id}>
            <td className="flex items-center gap-2">
              <img src={model.backgroundImage} alt={model.name} className="min-w-[46px] min-h-[31px] w-[46px] h-[31px] rounded-[5px]" />
              <div className="flex flex-col items-start">
                <div className="text-sm font-normal text-nowrap overflow-hidden text-ellipsis">{model.name}</div>
                <span className="flex-center line-clamp-1 text-xs gap-[3px] cursor-pointer" onClick={() => copyToClipboard(model.isRemote ? model.remoteUrl : `http://localhost:${model.port}`)}>
                  <p className="w-[130px] text-nowrap overflow-hidden text-ellipsis">{model.isRemote ? model.remoteUrl : `http://localhost:${model.port}`}</p> 
                  {showCheck ? (
                    <img src={checkIcon} alt="copy" className="invert w-[12px] h-[12px]"/>
                  ):(
                    <img src={copyIcon} alt="copy"/>
                  )}
                </span>
              </div>
            </td>
            <td className="text-right">
              <Switch checked={model.isRemote} onChange={() => toggleRemoteAccess(model)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RunningModelsDropDown;
