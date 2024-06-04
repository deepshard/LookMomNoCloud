import React from 'react'

import MemoryChipIcon from "../../icons/MemoryChip";
import ExternalDriveIcon from "../../icons/ExternalDrive";

function SysInfoTopBar() {
  return (
    <div className="fixed top-0 p-3.5 flex w-full items-center justify-between gap-2">

        <div className="flex items-center justify-start gap-1">
            <div className="flex justify-start items-center gap-1">
                {/* <div className={`${selectedOption == "memory" ? "text-surface-750" : "text-surface-500"} p-1.5 rounded-[5px] cursor-pointer`}> */}
                <div className={`text-surface-750 p-1.5 rounded-[5px] cursor-pointer`}>
                    {/* <MemoryChipIcon className="fill-current " height={14} width={14} onClick={() => setSelectedOption("memory")} /> */}
                    <MemoryChipIcon className="fill-current " height={14} width={14} />
                </div>

                {/* DIVIDER */}
                <div className="w-[1px] h-[12px] bg-surface-100" />

                {/* <div className={`${selectedOption == "storage" ? "text-surface-750" : "text-surface-500"} p-1.5 rounded-[5px] cursor-pointer`}> */}
                <div className={`text-surface-500 p-1.5 rounded-[5px] cursor-pointer`}>
                    {/* <ExternalDriveIcon className="fill-current" height={14} width={14} onClick={() => setSelectedOption("storage")} /> */}
                    <ExternalDriveIcon className="fill-current" height={14} width={14} />
                </div>
            </div>

            {/* <span className="text-surface-750 capitalize">{selectedOption}</span> */}
        </div>

        <div className="mr-1  text-xs">
            <div className="flex justify-start items-center gap-2.5">
                <p className='text-surface-500'>12</p>

                {/* DIVIDER */}
                <div className="w-[1px] h-[12px] bg-surface-100" />

                <p className='text-surface-750'>16 Gb</p>
            </div>
        </div>

    </div>
  )
}

export default SysInfoTopBar