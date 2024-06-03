import React, { useState } from "react";
import ProgressBar from "./common/ProgressBar";
import SysInfoModelComponent from "./SysInfoModelComponent";
import { useStore } from "../store/store";
//@ts-ignore
import MemoryIcon from "/assets/icons/memory.png";
//@ts-ignore
import StorageIcon from "/assets/icons/storage.png";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { motion } from 'framer-motion';
import 'react-circular-progressbar/dist/styles.css';
import { bytesToHumanReadable } from "../utils";
import { TSysInfo } from "../types/schemas";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Command, CommandGroup, CommandItem, CommandList } from "./Command";
import MemoryChipIcon from "../icons/MemoryChip";
import ExternalDriveIcon from "../icons/ExternalDrive";

type OptionType = 'memory' | 'storage';

const ModelsList = ({ sysInfo }: { sysInfo: TSysInfo }) => {
  // if (!sysInfo) return <></>;

  let sysInfoTemporary = {
    resources: {
      models: [
        { id: '1', ram: 1024, disk: 2048 },
        { id: '2', ram: 2048, disk: 4096 },
        { id: '3', ram: 4096, disk: 8192 },
      ]
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {sysInfoTemporary.resources.models.map((model) => (
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

      <div className="absolute top-0 backdrop-blur-3xl w-full h-full rounded-md" />
      <div className="absolute top-0 backdrop-blur-3xl w-full h-full rounded-md" />
      <div className="absolute top-0 backdrop-blur-3xl w-full h-full rounded-md" />
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
    <div className="w-full h-full flex flex-col justify-start items-center p-3.5 gap-7" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      
      <div className="flex w-full items-center justify-between gap-2">

        <div className="flex items-center justify-start gap-1">
          <div className="flex justify-start items-center gap-1">
            <div className={`${selectedOption=="memory" ? "" : ""} p-1.5 rounded-[5px] cursor-pointer`}>
              <MemoryChipIcon color={"white"} height={14} width={14} onClick={() => setSelectedOption("memory")} />
            </div>

            {/* DIVIDER */}
            <div className="w-[1px] h-[12px] bg-surface-100" />

            <div className={`${selectedOption=="storage" ? "" : ""} p-1.5 rounded-[5px] cursor-pointer`}>
              <ExternalDriveIcon color={"white"} height={14} width={14} onClick={() => setSelectedOption("storage")} />
            </div>
          </div>

          {/* <span className="text-surface-750 capitalize">{selectedOption}</span> */}
        </div>

        <div className="text-surface-750 text-sm">
          {selectedOption === 'memory' ? (
            <div className="flex justify-start items-center gap-2.5">
              <p>{bytesToHumanReadable(sysInfo?.resources.total.ram - sysInfo?.resources.available.ram, false)}</p>
              
              {/* DIVIDER */}
              <div className="w-[1px] h-[12px] bg-surface-100" />

              <p>{bytesToHumanReadable(sysInfo?.resources.total.ram)}</p>
            </div>
          ) : (
            <div className="flex justify-start items-center gap-2.5">
              <p>{bytesToHumanReadable(sysInfo?.resources?.total?.disk - sysInfo?.resources?.available?.disk, false)}</p>
              
              {/* DIVIDER */}
              <div className="w-[1px] h-[12px] bg-surface-100" />

              <p>{bytesToHumanReadable(sysInfo?.resources?.total?.disk)}</p>
            </div>
          )}
        </div>
      </div>

      {/* <div className="w-full gap-2 flex items-start justify-between">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              role="combobox"
              className="text-surface-750 capitalize outline-none"
            >
              {selectedOption}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" alignOffset={-6} sideOffset={12} className="w-[200px] p-0 widget-3d outline-none border-none">
            <Command className="rounded-sm">
              <CommandList>
                <CommandGroup className="flex flex-col gap-4 p-0">
                  <CommandItem
                    key={"memory"}
                    value={"memory"}
                    className={`px-4 py-3 ${selectedOption=="memory" ? "text-surface-750" : "text-surface-500 hover:text-surface-750 hover:bg-surface-100"} rounded-none cursor-pointer`}
                    onSelect={(currentValue) => {
                      setSelectedOption("memory")
                      setIsOpen(false)
                    }}
                  >
                    Memory
                  </CommandItem>

                  <div className="w-full h-[1px] bg-surface-100" />

                  <CommandItem
                    key={"storage"}
                    value={"storage"}
                    className={`px-4 py-3 ${selectedOption=="storage" ? "text-surface-750" : "text-surface-500 hover:text-surface-750 hover:bg-surface-100"} rounded-none cursor-pointer`}
                    onSelect={(currentValue) => {
                      setSelectedOption("storage")
                      setIsOpen(false)
                    }}
                  >
                    Storage
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div> */}


      <div className="w-32 -mt-8 mx-auto">
        <CircularProgressbar
          value={usedPercentage}
          text={isHovered ? `${usedPercentage.toFixed(0)}%` : ' '}
          strokeWidth={14}
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