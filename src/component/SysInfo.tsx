import { useState } from "react";
import { useStore } from "../store/store";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { motion } from 'framer-motion';
import 'react-circular-progressbar/dist/styles.css';
import { bytesToHumanReadable } from "../utils/sysUtils";
import { TSysInfo } from "../types/schemas";

type OptionType = 'memory' | 'storage';

const OptionSelector = ({  onSelect }: { onSelect: (option: OptionType) => void }) => (
  <div className="absolute w-32 bg-gray-400">
    <div className="flex items-center p-2 gap-2 cursor-pointer" onClick={() => onSelect('memory')}>
      <img src={'/assets/icons/memory.png'} alt="Memory" className="w-10 h-10" />
      Memory
    </div>
    <div className="flex items-center p-2 gap-2 cursor-pointer" onClick={() => onSelect('storage')}>
      <img src={'/assets/icons/storage.png'} alt="Storage" className="w-10 h-10" />
      Storage
    </div>
  </div>
);

const ModelsList = ({ sysInfo }: { sysInfo: TSysInfo | null }) => {
  if (!sysInfo) return <></>;

  return (
    <div className="flex flex-col gap-2">
      {sysInfo.resources.models.map((_) => (
        <div className='flex w-full  items-center py-2.5 pl-2.5 pr-3.5 gap-2 bg-surface-100 rounded-sm'>
          <img src="/assets/images/llama1.png" alt="" className='w-[30px] h-[30px] rounded-xs ' />
          <div className='flex flex-col justify-center items-start grow'>
              <p className='text-surface-750 title-sm'>Llama-3</p>
              <span className='flex gap-1 items-center -mt-1'>
                  <div className='w-1.5 h-1.5 bg-success-regular rounded-full' />
                  <p className='text-surface-500 callout-sm'>750 MB</p>
                  {/* <p key={model.id} className="bg-gray-300 my-2 p-5 rounded-sm">{model.id} |  {bytesToHumanReadable(model.ram)} | {bytesToHumanReadable(model.disk)}</p> */}
              </span>
          </div>
          <p className='text-surface-500 callout-sm'>30%</p>
    </div>
      ))}
    </div>
  );
};

const SysInfoOverview = ({ option, usedPercentage }: { option: OptionType, usedPercentage: number }) => {
  return (
    <div className="relative flex flex-col items-center justify-between p-3 h-44 bg-surface-100 backdrop-blur-2xl rounded-md border-t-4 border-surface-500">
      <p className="title-base text-surface-400">{option === 'memory' ? 'PC Memory Usage' : 'PC Storage Used'}</p>
      
      <div className="relative -mt-6 flex items-center justify-center gap-1.5 text-surface-750">
        <p className="text-6xl">{usedPercentage.toFixed(0)}</p>
        <p className="absolute -right-6 text-lg">%</p>
      </div>
      
      {/* DON'T DELETE :: Meant only for perfect alignment purposes */}
      <div />
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
    <div className="w-full h-full flex flex-col justify-start items-center p-4 gap-7" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>

      <div className="w-full gap-2 flex items-start justify-between">
        <div className="bg-transparent flex gap-2 items-center text-surface-750 text-sm outline-none cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}>
          <img src={selectedOption === 'memory' ? '/assets/icons/memory.png' : '/assets/icons/storage.png'} alt={selectedOption} className="h-3.5" />
          {selectedOption === 'memory' ? 'Memory' : 'Storage'}
        </div>
        {isOpen && <OptionSelector onSelect={handleSelectChange} />}
        <div className="text-surface-750 text-sm">
          {selectedOption === 'memory' ? (
            <div>{bytesToHumanReadable((sysInfo?.resources.total.ram || 0) - (sysInfo?.resources.available.ram || 0), false)} / {bytesToHumanReadable(sysInfo?.resources.total.ram)}</div>
          ) : (
            <div>{bytesToHumanReadable((sysInfo?.resources?.total?.disk || 0) - (sysInfo?.resources?.available?.disk || 0), false)} / {bytesToHumanReadable(sysInfo?.resources?.total?.disk)}</div>
          )}
        </div>
      </div>

      <div className="w-32 -mt-8 mx-auto">
        <CircularProgressbar 
          value={usedPercentage} 
          text={isHovered ? `${usedPercentage.toFixed(0)}%` : ' '}
          strokeWidth={16}
          styles={buildStyles({
            textColor: 'rgba(255, 255, 255, 0.75)',
            pathColor: 'rgba(255, 255, 255, 1)',
            trailColor: 'rgba(255, 255, 255, 0.1)',
            textSize: '12px',
            pathTransitionDuration: 0.5,
          })}
        />
      </div>

      <div className="flex flex-col flex-grow w-full h-full overflow-y-scroll">
        <ModelsList sysInfo={sysInfo} />
      </div>


      <motion.div
        variants={hoverVariants}
        initial="visible"
        animate={!isHovered ? "visible" : "hidden"}
        className="absolute w-full bottom-0 p-2"
      >
        <SysInfoOverview option={selectedOption} usedPercentage={usedPercentage} />

      </motion.div>
    </div>
  );
};

export default SysInfo;