import React from 'react'
import truffleHardwareLandscapeIcon from "../../../assets/icons/truffle-hardware-landscape.svg";
import downloadFillIcon from "../../../assets/icons/download-fill.svg";

//@ts-ignore

const UpdateTruffle = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`min-w-[241px] widget-3d px-[14px] py-[10px] cursor-pointer ${className}`} {...props}>
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