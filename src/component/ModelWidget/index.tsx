import { useEffect, useState } from 'react'
import { CircularProgressbar } from 'react-circular-progressbar'
import { TModel } from '../../types/schemas'
import { motion } from 'framer-motion'
import { toUnitOfCount } from '../../utils/sysUtils'
import Tooltip from '../common/Tooltip'
import './index.css'
import 'react-circular-progressbar/dist/styles.css'

const OverlaySVG = ({ width = 128, height = 82 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 124 79"
    fill="none"
  >
    <defs>
      <filter
        id="blur_filter"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur stdDeviation="25" />
      </filter>
      <linearGradient
        id="overlay_gradient"
        x1="62"
        y1="79"
        x2="61.9999"
        y2="2.96496e-06"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-opacity="0" />
        <stop offset="0.268371" stop-opacity="0.3" />
        <stop offset="1" stop-opacity="0.5" />
      </linearGradient>
    </defs>

    <rect
      width="100%"
      height="100%"
      rx="13"
      fill="black"
      fill-opacity="0.2"
      filter="url(#blur_filter)"
    />

    <rect
      width="100%"
      height="100%"
      rx="13"
      fill="url(#overlay_gradient)"
      fill-opacity="0.8"
    />
  </svg>
)

interface ModelWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  model: TModel
}

const ModelWidget = ({
  model,
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
      model.onDisconnect && model.onDisconnect()
    }
  }, [])

  const handleAction = () => {
    switch (model.status) {
      case 'NOT_DOWNLOADED':
        model.onInstall && model.onInstall()
        break
      case 'RUNNING':
        model.onStop && model.onStop()
        break
      case 'STOPPED':
        model.onRun && model.onRun()
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
          >
            <CircularProgressbar
              value={model.progress || 0}
              text={`${model.progress}%`}
              styles={{
                path: { stroke: 'rgba(255, 255, 255, 1)' },
                trail: { stroke: 'rgba(255, 255, 255, 0.4)' },
                text: { fill: 'rgba(255, 255, 255, 0.85)', fontSize: '30px' },
              }}
            />
          </motion.div>
        )
      case 'ACKNOWLEDGED':
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
      case 'NOT_DOWNLOADED':
        return (
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
        )
      default:
        return null
    }
  }

  return (
    <div className="relative">
      {model.status === 'RUNNING' && (
        <div className="glow-container">
          <div className="glow-effect"></div>
        </div>
      )}
      <div
        className={`model-widget base-regular ${className} relative`}
        {...props}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={model.backgroundImage} alt="" className="w-full h-full absolute inset-0 object-cover" />
  
        <div
          className={`
            absolute inset-0
            h-full w-full
            ${model.status === 'RUNNING' ? 'bg-black/70' : 'bg-black/10'}
          `}
        >
          <OverlaySVG />
        </div>
  
        <div className="absolute top-0 left-0 p-2 w-full">
          <div className="relative flex flex-col w-full">
            <div className="text-content flex flex-col overflow-hidden w-full">
              <span className='title-xs inline-block capitalize truncate text-surface-main leading-normal'>
                {model?.name.split('/')[1]}
              </span>
              <span className='title-xs inline-block capitalize truncate text-surface-750 leading-normal'>
                {toUnitOfCount(model?.size)} • {model?.author}
              </span>
            </div>
          </div>
        </div>
      </div>
      {getWidgetButton()}
      {model.error && <div className="absolute top-2 right-2">{getErrorButton(model.error)}</div>}
    </div>
  )
}

export default ModelWidget;
