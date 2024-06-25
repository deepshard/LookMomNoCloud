import React from 'react'
import llamaImage from "../../assets/images/llama1.png";

const SysInfoModelComponent = () => {
  return (
    <div className='flex w-full border-b-[4px] border-[#FFFFFF1A] items-center py-[8px] pl-[8px] pr-[16px]'>
        <img src={llamaImage} alt="" className='w-[32px] h-[32px] rounded-[4px] mr-[9px]' />
        <span className='grow'>
            <p className='text-surface-750 title-sm'>Llama-3</p>
            <span className='flex gap-1 items-center'>
                <div className='w-[6px] h-[6px] bg-success rounded-full' />
                <p className='text-surface-500 callout-sm'>750 MB</p>
            </span>
        </span>
        <p className='text-surface-500 callout-sm'>30%</p>
    </div>
  )
}

export default SysInfoModelComponent