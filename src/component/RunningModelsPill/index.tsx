import React from 'react'
import { TModel } from '../../types/schemas'
import './RunningModelsPill.css'

interface RunningModelsPillProps extends React.HTMLAttributes<HTMLDivElement> {
    models: TModel[]
}
const RunningModelsPill = ({ models, className='', ...props}: RunningModelsPillProps) => {
  return (
    <div className={`flex-center gap-[6px] min-w-[147px] py-[6px] pl-2 pr-3 widget-3d ${className}`} {...props}>
        <span className='models'>
            {[...models, ...models, ...models].slice(0, 3).map((model) => (
                <img key={model.id} src={model.backgroundImage} alt="" className='model-pill'/>
            ))}
        </span>
        <p>{models.length} Models Running</p>
    </div>
  )
}

export default RunningModelsPill