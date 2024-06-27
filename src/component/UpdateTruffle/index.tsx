import React from 'react'
// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";
// @ts-ignore
import downloadFillIcon from "../../assets/icons/download-fill.svg";

const UpdateTruffle = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`min-w-[240px] glass-3d px-[14px] py-[10px] bg-black/10 hover:bg-black/[15%] rounded-2xl transition ease-out 0.5s cursor-pointer ${className}`} {...props}>
      <span className='flex justify-between items-center gap-3'>
        <img src={truffleHardwareLandscapeIcon} alt="" className='w-[40px] h-[22px]'/>
        <span className='mr-5'>
          <p className='text-xs text-surface-500'>New TruffleOS</p>
          <p className='text-sm font-normal'>Update OS version</p>
        </span>
        <img src={downloadFillIcon} alt="" className='w-[30px] h-[30px]'/>
      </span>
    </div>
  )
}

export default UpdateTruffle