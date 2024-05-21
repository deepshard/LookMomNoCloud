import React from 'react'

const SysInfoModelComponent = () => {
  return (
    <div className='flex w-full border-b-[4px] border-[#FFFFFF1A] items-center py-[8px] pl-[8px] pr-[16px]'>
        <img src="/assets/images/llama1.png" alt="" className='w-[32px] h-[32px] rounded-[4px] mr-[9px]' />
        <span className='grow'>
            <p>Llama-3</p>
            <span className='flex gap-1 items-center'>
                <div className='w-[6px] h-[6px] bg-success rounded-full' />
                <p>750 MB</p>
            </span>
        </span>
        <p>30%</p>
    </div>
  )
}

export default SysInfoModelComponent