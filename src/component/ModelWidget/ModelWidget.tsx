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
  const downloadIcon = '/src/assets/icons/download.svg'
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
      case "ACKNOWLEDGED":
      case 'INSTALLING':
        return (
          <div className="h-[30px] w-[30px] absolute bottom-0 right-0 m-2 bg-[#D9D9D94D] rounded-full">
            <img src={installIcon} alt="" className="animate-spin" />
          </div>
        )
      case 'STOPPED':
        return (
          <div
            onClick={(e) => {
              e.stopPropagation()
              handleAction()
            }}
            className="play-button"
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
            className="stop-button"
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
          className="w-full min-h-[78px]"
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
        <img src={model.backgroundImage} alt="" className="w-full h-full" />

        {/* This part is the background image and its blur overlay, control directly from the css in this folder */}
        <div
          className={`
            absolute inset-0 z-99
            h-full w-full
            ${model.status === 'RUNNING' ? 'bg-black/70' : 'bg-black/10'}
          `}
        >
          <div className="blur-overlay"></div>
          <div className="linear-overlay"></div>
        </div>

        {/* This part is the widget content */}
        <div className="absolute top-0 left-0 p-2 nowrap z-[100]">
          <div className="relative">
            <div className="text-content">
              <span className='title-xs inline-block relative capitalize max-w-80 truncate text-surface-main'>
                {model?.name.split('/')[1]}
              </span>
              <span className='title-xs inline-block relative capitalize max-w-120 truncate text-surface-750'>
                {toUnitOfCount(model?.size)} • {model?.author}
              </span>
            </div>
          </div>
        </div>
        <p className="title-sm text-surface-750 absolute bottom-0 left-0 p-2 scroll-on-hover"></p>
        {getWidgetButton()}
      </div>

      {model.status == 'NOT_DOWNLOADED' && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            handleAction()
          }}
          className="install-button absolute"
        >
          <img src={downloadIcon} alt="" className="icon-small" />
          <span className="text-xs nowrap relative capitalize">Install</span>
        </div>
      )}
      {model.error && getErrorButton(model.error)}
    </div>
  )
}
export default ModelWidget
