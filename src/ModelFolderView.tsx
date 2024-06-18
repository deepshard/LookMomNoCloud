import React from 'react'

function ModelFolderView() {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center bg-black/50 bg-blur-[150px]'>
        {/* Model Cards */}
        <div className='grid grid-cols-3 gap-y-[52px] gap-x-[140px]'>
          {[...Array(9)].map((_, index) => (
            <div key={index} className='flex flex-col items-center justify-center'>
                {/* Model's Image */}
                <div className='w-[124px] h-[78px] glass-3d rounded-sm' />

                <div className='absolute -bottom-4 flex flex-col items-center justify-center gap-0.5'>
                    <p className='title-xs text-surface-main'>Model's Name</p>

                    {/* On hover of card – show, else hide */}
                    {/* <p className='title-xs text-surface-500'>Model's Author Name</p> */}
                </div>
            </div>
          ))}
        </div>
        
    </div>
  )
}

export default ModelFolderView