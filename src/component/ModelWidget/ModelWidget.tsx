import { useEffect, useState } from 'react'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { TModel } from '../../types/schemas'
import { motion } from 'framer-motion'
import { toUnitOfCount } from '../../utils/sysUtils'
import ScrollingText from '../common/ScrollingText'
import Tooltip from '../common/Tooltip'
import './ModelWidget.css'

interface ModelWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  model: TModel
  type?: 'regular' | 'my-model'
  onInstall?: () => void
  onRun?: () => void
  onStop?: () => void
  onDelete?: () => void
  onDisconnect?: () => void
}

const ModelWidget = ({
  model,
  type = 'regular',
  onInstall,
  onRun,
  onStop,
  onDelete,
  onDisconnect,
  className = '',
  ...props
}: ModelWidgetProps) => {
  const downloadIcon = '/src/assets/icons/download-fill.svg'
  const playIcon = '/src/assets/icons/play.svg'
  const stopIcon = '/src/assets/icons/stop.svg'
  const installIcon = '/src/assets/icons/install.svg'
  const errorIcon = '/src/assets/icons/error.svg'

  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    return () => {
      onDisconnect && onDisconnect()
    }
  }, [])

  const handleAction = () => {
    switch (model.status) {
      case 'NOT_DOWNLOADED':
        onInstall && onInstall()
        break
      case 'RUNNING':
        onStop && onStop()
        break
      case 'STOPPED':
        onRun && onRun()
        break
      default:
        break
    }
  }

  const getErrorButton = (errorMessage: string) => {
    return (
      <Tooltip
        overlayClassName="rounded-sm glass-3d"
        overlayInnerStyle={{
          color: 'surface-500',
          padding: '10px',
          fontSize: '12px',
        }}
        placement="bottom"
        color="transparent"
        title={errorMessage}
      >
        <div className={`error-icon`}>
          <img src={errorIcon} alt="errorIcon" className="w-full h-full" />
        </div>
      </Tooltip>
    )
  }

  const getWidgetButton = () => {
    switch (model.status) {
      case 'DOWNLOADING':
        return (
          <motion.div
            className="h-[30px] w-[30px] absolute bottom-0 right-0 m-2 widget-3d rounded-full"
            initial={{ opacity: 0, scale: 0.8 }} // starts from invisible and scaled down
            animate={{ opacity: 1, scale: 1 }} // animate to fully visible and normal size
            transition={{ duration: 0.1, ease: 'easeInOut' }} // duration and timing function
          >
            <CircularProgressbar
              value={model.progress || 0}
              text={`${model.progress}%`}
              styles={{
                path: { stroke: 'rgba(255, 255, 255, 1)' },
                trail: { stroke: 'rgba(255, 255, 255, 0.4)' },
                text: { fill: 'rgba(255, 255, 255, 0.75)', fontSize: '25px' },
              }}
            />
          </motion.div>
        )
      case 'INSTALLING':
        return (
          <div className="h-[30px] w-[30px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <img src={installIcon} alt="" className="animate-spin" />
          </div>
        )
      case 'NOT_DOWNLOADED':
        return (
          <div
            onClick={(e) => {
              e.stopPropagation()
              handleAction()
            }}
            className={`h-[30px] w-[30px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full transition transition-200 widget-3d`}
          >
            <img src={downloadIcon} alt="" />
          </div>
        )
      case 'STOPPED':
        return (
          <div
            onClick={(e) => {
              e.stopPropagation()
              handleAction()
            }}
            className={`flex-center h-[30px] w-[30px] absolute bottom-[50%] translate-y-[50%] left-[50%] translate-x-[-50%] bg-[#D9D9D94D] rounded-full transition transition-200  widget-3d cursor-pointer`}
          >
            <img src={playIcon} alt="" />
          </div>
        )
      case 'RUNNING':
        return (
          <div
            onClick={(e) => {
              e.stopPropagation()
              handleAction()
            }}
            className={`h-[30px] w-[30px] absolute bottom-[50%] translate-y-[50%] bg-[#d9d9d9] flex-center rounded-full left-[50%] translate-x-[-50%]`}
          >
            <img src={stopIcon} alt="" className="" />
          </div>
        )

      default:
        break
    }
  }

  if (type === 'my-model') {
    return (
      <div className={`model-my-models base-regular ${className}`} {...props}>
        <img
          src={model.backgroundImage}
          alt=""
          className="w-full min-h-[78px] rounded-[13px]"
        />
        <p className="callout-regular text-surface-main w-full text-center mt-[11px]">
          {model.title}
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {model.status === 'RUNNING' && (
        <div className="glow-container">
          <div className="glow-effect"></div>
        </div>
      )}
      <div
        className={`model-widget base-regular ${className} relative z-10`}
        {...props}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-black/10 z-88  glass-3d-no-blur"></div>
        <img src={model.backgroundImage} alt="" className="w-full h-full" />
        <div className="absolute top-0 left-0 p-2 nowrap">
          <div className="relative">
            {' '}
            {/* Add this wrapper */}
            <div className="model-widget-text-holder"></div>
            <div className="text-content">
              {' '}
              {/* Wrap text content */}
              <ScrollingText
                className="text-sm nowrap relative capitalize"
                text={model?.name.split('/')[1]}
                isHovered={isHovered}
              />
              <div className="flex items-start gap-0.5 -mt-[6px]">
                <span className="text-xs text-surface-main relative opacity-75">
                  <ScrollingText text={model?.author} isHovered={isHovered} />{' '}
                </span>
                <span className="text-xs text-surface-main relative opacity-75">
                  {' '}
                  •{' '}
                </span>
                <span className="text-xs text-surface-main relative opacity-75 capitalize">
                  {toUnitOfCount(model?.size)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="title-sm text-surface-750 absolute bottom-0 left-0 p-2 scroll-on-hover"></p>
        {getWidgetButton()}
      </div>
      {model.error && getErrorButton(model.error)}
    </div>
  )
}
export default ModelWidget
