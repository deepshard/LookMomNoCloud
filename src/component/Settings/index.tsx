// @ts-ignore
import gearIcon from "../../assets/icons/gear.svg";
// @ts-ignore
import dataCollectionIcon from "../../assets/icons/data-collection.svg";
import { Switch } from "antd";
import "./Settings.css";
import { useState } from "react";
import { useAppStore } from "../../store/store";

const Settings = () => {
    const {setSetting, settings} = useAppStore()
    const [isCheckingData, setIsCheckingData] = useState(settings.collectData)
  const onChange = (checked: boolean) => {
    setIsCheckingData(checked)
    setSetting('collectData', checked)
  };
  return (
    <div className="h-full px-[145px] pt-[126px]">
      <span className="flex items-center gap-[10px]">
        <img src={gearIcon} className="w-6 h-6" />
        <h1 className="text-surface-main text-[32px]">Settings</h1>
      </span>

      <div className="flex justify-between items-center mt-[40px]">
        <span className="flex-center gap-2">
          <img src={dataCollectionIcon} alt="data collection" className="w-[14px] h-[14px]" />
          <p>Data Collection</p>
        </span>
        <Switch value={isCheckingData} onChange={onChange} className={`${isCheckingData ? 'switch-enabled' : ''}`} />
      </div>
    </div>
  );
};

export default Settings;
