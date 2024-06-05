import React from 'react'
import SysInfoProgressBar from './SysInfoProgressBar'
import SysInfoModelsList from './SysInfoModelList'
import SysInfoTopBar from './SysInfoTopBar'
import SysInfoOverviewCard from './SysInfoOverviewCard'

function NewSysInfo() {
  return (
    <div className='w-full h-full flex flex-col justify-start items-center px-3.5 pt-14 gap-7 overflow-y-scroll hide-scrollbar'>
      {/* TOP BAR */}
      <SysInfoTopBar />

      {/* PROGRESS BAR */}
      <div className="w-32 -mt-3">
        <SysInfoProgressBar />
      </div>

      {/* MODELS INFO */}
      <div className='w-full pb-3.5'>
        <SysInfoModelsList />
      </div>

      {/* OVERFLOW CARD */}
      <div className="w-full h-[60%] px-1.5 pb-1.5 absolute mx-10 !bottom-0 bg-red-500" >
        <div className="sysinfo-overflow ">

        </div>
        {/* <SysInfoOverviewCard /> */}
      </div>
    </div>
  )
}

export default NewSysInfo