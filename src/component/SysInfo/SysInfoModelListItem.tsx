import { TModel } from "../../types/schemas"

interface SysInfoModelListItemProps {
  model?: TModel
}
function SysInfoModelListItem({model}: SysInfoModelListItemProps) {
  return (
    <div className='sysinfo-model-item'>
      
        <img src="/assets/images/llama1.png" alt="" className='w-[30px] h-[30px] rounded-xs z-10' />
        
        <div className='flex flex-col justify-center items-start grow z-10'>
            <p className='text-surface-750 title-sm'>{model?.title || "Llama-3"}</p>
            
            <span className='flex gap-1 items-center -mt-1'>
                <div className='w-1.5 h-1.5 bg-success-regular rounded-full' />
                <p className='text-surface-500 callout-sm'>750 MB</p>
                {/* <p key={model.id} className="bg-gray-300 my-2 p-5 rounded-sm">{model.id} |  {bytesToHumanReadable(model.ram)} | {bytesToHumanReadable(model.disk)}</p> */}
            </span>
        </div>

        <p className='pr-1 text-surface-500 z-10'>30%</p>
    </div>
  )
}

export default SysInfoModelListItem