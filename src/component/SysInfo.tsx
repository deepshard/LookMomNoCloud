import { useState } from "react";
import { useStore } from "../store/store";
import { CircularProgressbar } from 'react-circular-progressbar';
import { motion } from 'framer-motion';
import 'react-circular-progressbar/dist/styles.css';
import { bytesToHumanReadable } from "../utils/sysUtils";
import { TSysInfo } from "../types/schemas";

type OptionType = 'memory' | 'storage';

const OptionSelector = ({  onSelect }: { onSelect: (option: OptionType) => void }) => (
  <div className="absolute w-32 bg-gray-400">
    <div className="flex items-center p-2 cursor-pointer" onClick={() => onSelect('memory')}>
      <img src={'/assets/icons/memory.png'} alt="Memory" className="w-10 h-10 mr-2" />
      Memory
    </div>
    <div className="flex items-center p-2 cursor-pointer" onClick={() => onSelect('storage')}>
      <img src={'/assets/icons/storage.png'} alt="Storage" className="w-10 h-10 mr-2" />
      Storage
    </div>
  </div>
);

const ModelsList = ({ sysInfo }: { sysInfo: TSysInfo | null }) => {
  if (!sysInfo) return <></>;

  return (
    <div className="p-5">
      {sysInfo.resources.models.map((model) => (
        <div key={model.id} className="bg-gray-300 my-2 p-5 rounded-sm">{model.id} |  {bytesToHumanReadable(model.ram)} | {bytesToHumanReadable(model.disk)}</div>
      ))}
    </div>
  );
};

const SysInfoOverview = ({ option, usedPercentage }: { option: OptionType, usedPercentage: number }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <p>{option === 'memory' ? 'Memory usage' : 'Storage Used'}</p>
      <p className="text-4xl">{usedPercentage.toFixed(0)}%</p>
    </div>
  );
};

const SysInfo = () => {
  const sysInfo = useStore(state => state.sysInfo);
  const [selectedOption, setSelectedOption] = useState<OptionType>('memory');
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // State to track hover

  const handleSelectChange = (value: OptionType) => {
    setSelectedOption(value);
    setIsOpen(false);
  };

  const calculateUsedPercentage = (): number => {
    if (!sysInfo) return 0;
    let total = 0;
    let available = 0;
    if (selectedOption === 'memory') {
      total = sysInfo.resources.total.ram;
      available = sysInfo.resources.available.ram;
    } else {
      total = sysInfo.resources.total.disk;
      available = sysInfo.resources.available.disk;
    }
    return ((total - available) / total) * 100;
  };

  const usedPercentage = calculateUsedPercentage();

  const hoverVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    hidden: { opacity: 1, y: 500, transition: { duration: 0.2 } }
  };

  return (
    <div className="" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <motion.div
        variants={hoverVariants}
        initial="visible"
        animate={!isHovered ? "visible" : "hidden"}
        className="absolute w-full bottom-0 h-80 bg-gray-400"
      >
        <SysInfoOverview option={selectedOption} usedPercentage={usedPercentage} />
      </motion.div>

      <div className="w-full h-full p-2 flex items-start justify-between">
        <div className="w-32 bg-transparent flex items-center color-black outline-none cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}>
          <img src={selectedOption === 'memory' ? '/assets/icons/memory.png' : '/assets/icons/storage.png'} alt={selectedOption} className="w-10 h-10 mr-2" />
          {selectedOption === 'memory' ? 'Memory' : 'Storage'}
        </div>
        {isOpen && <OptionSelector onSelect={handleSelectChange} />}
        <div>
          {selectedOption === 'memory' ? (
            <div>{bytesToHumanReadable((sysInfo?.resources.total.ram || 0) - (sysInfo?.resources.available.ram || 0), false)} / {bytesToHumanReadable(sysInfo?.resources.total.ram)}</div>
          ) : (
            <div>{bytesToHumanReadable((sysInfo?.resources?.total?.disk || 0) - (sysInfo?.resources?.available?.disk || 0), false)} / {bytesToHumanReadable(sysInfo?.resources?.total?.disk)}</div>
          )}
        </div>
      </div>
      <div className="w-36 mx-auto">
        <CircularProgressbar value={usedPercentage} text={isHovered ? `${usedPercentage.toFixed(0)}%` : ' '} />
      </div>

      <div className="h-56 overflow-y-scroll bg-blue-500">
        <ModelsList sysInfo={sysInfo} />
      </div>

    </div>
  );
};

export default SysInfo;