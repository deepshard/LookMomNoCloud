import React from 'react'

function DiscoverItem() {
  return (
    <div className="relative w-[200px] h-[228px] bg-bg-wdget glass-3d rounded-lg flex flex-col p-4 gap-1 justify-end items-start" >
        
        {/* TO DO: ADD IMAGE !! */}
        <div className="absolute top-0 left-0 w-full h-full blur-md"></div>

        {/* TO DO: ADD GRADUAL BLUR */}

        <div className="title-base text-surface-750 -mb-1">LlaMa–3</div>
        
        <div className="flex gap-0 text-xs text-surface-500 leading-tight">
            <p>Meta</p>
            <p>•</p>
            <div className="flex gap-0.5">
                <p>100k</p>
                <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/d204f225717e7431a60f0b4bcf54100583d0c73225b201e1d244a6c6d64c2f74?"
                    className="shrink-0 my-auto w-1.5 aspect-[0.75]"
                />
            </div>
        </div>
        
        <div className="mt-1 text-xs text-surface-500 line-clamp-3">
            Today, we’re introducing DeepSeek-V2, a strong Mixture-of-Experts (MoE)
            language models, and im adding more text to see if it gets truncated
        </div>
    </div>
  )
}

export default DiscoverItem