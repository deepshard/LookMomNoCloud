import React from 'react'

function SysInfoOverviewCard() {
  return (
    <div className="flex flex-col items-center justify-between p-3 h-44 bg-surface-100 rounded-md border-t-4 border-surface-500">
      {/* <p className="title-base text-surface-400">{option === 'memory' ? 'PC Memory Usage' : 'PC Storage Used'}</p> */}
      <p className="title-base text-surface-400">PC Memory Usage</p>

      <div className="relative -mt-6 flex items-center justify-center gap-1.5 text-surface-750">
        <p className="text-6xl">10</p>
        <p className="absolute -right-6 text-lg">%</p>
      </div>

      {/* DON'T DELETE :: Meant only for perfect alignment purposes */}
      <div />
    </div>
  )
}

export default SysInfoOverviewCard