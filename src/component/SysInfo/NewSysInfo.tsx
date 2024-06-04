import React from 'react'
import SysInfoProgressBar from './SysInfoProgressBar'
import SysInfoModelsList from './SysInfoModelList'
import SysInfoTopBar from './SysInfoTopBar'
import SysInfoOverviewCard from './SysInfoOverviewCard'

function NewSysInfo() {
  return (
    <div className='relative w-full h-full flex flex-col justify-start items-center px-3.5 pt-14 gap-7 overflow-y-scroll hide-scrollbar'>
      {/* TOP BAR */}
      <SysInfoTopBar />

      {/* PROGRESS BAR */}
      <div className="w-32 -mt-3">
        <SysInfoProgressBar />
      </div>

      {/* MODELS INFO */}
      <SysInfoModelsList />

      {/* OVERVIEW CARD */}
      <div className="z-1 w-full p-1.5 fixed bottom-0" >
        <SysInfoOverviewCard />
      </div>
    </div>
  )
}

export default NewSysInfo