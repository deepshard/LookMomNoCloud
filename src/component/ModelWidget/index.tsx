import { useEffect, } from 'react'
import { CircularProgressbar } from 'react-circular-progressbar'
import { TModel } from '../../types/schemas'
import { motion } from 'framer-motion'
import { toUnitOfCount } from '../../utils/sysUtils'
import Tooltip from '../common/Tooltip'
import './index.css'
import 'react-circular-progressbar/dist/styles.css'
import LazyImage from '../LazyImage'

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
        colorInterpolationFilters="sRGB"
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
        <stop stopOpacity="0" />
        <stop offset="0.268371" stopOpacity="0.3" />
        <stop offset="1" stopOpacity="0.5" />
      </linearGradient>
    </defs>

    <rect
      width="100%"
      height="100%"
      rx="13"
      fill="black"
      fillOpacity="0.2"
      filter="url(#blur_filter)"
    />

    <rect
      width="100%"
      height="100%"
      rx="13"
      fill="url(#overlay_gradient)"
      fillOpacity="0.8"
    />
  </svg>
)

interface ModelWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  model: TModel
  onInstall?: () => void
  onRun?: () => void
  onStop?: () => void
  onCleanup?: () => void
}

const ModelWidget = ({
  model,
  className = '',
  onInstall,
  onRun,
  onStop,
  onCleanup,
  ...props
}: ModelWidgetProps) => {
  const downloadIcon = '/src/assets/icons/download.svg'
  const playIcon = '/src/assets/icons/play.svg'
  const stopIcon = '/src/assets/icons/stop.svg'
  const installIcon = '/src/assets/icons/install.svg'
  const errorIcon = '/src/assets/icons/error.svg'
  const retryIcon = '/src/assets/icons/retry.svg'

  useEffect(() => {
    return () => {
      onCleanup && onCleanup()
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
        <img src={errorIcon} alt="errorIcon" className="error-icon" />
      </Tooltip>
    )
  }

  const getWidgetButton = () => {
    switch (model.status) {
      case 'DOWNLOADING':
        return (
          model.error ?
            (
            <div className="play-button">
              <img src={retryIcon} style={{ width: '17px', height: '17px' }} />
            </div>) :
            (<motion.div
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
            </motion.div>)
        )
      case 'ACKNOWLEDGED':
      case 'INSTALLING':
        return (
          <div className="play-button">
            {
              model.error ? 
              (<img src={retryIcon} alt="retryIcon" style={{ width: '17px', height: '17px' }}/>) :
              (<img src={installIcon} alt="installIcon" className="animate-spin" />)
            }
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
            {
              model.error ?
              (<img src={retryIcon} alt="retryIcon" style={{ width: '17px', height: '17px' }} />) :
              (<img src={playIcon} alt="playIcon" />)
            }
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
    <div className="relative" {...props}>
      {model.status === 'RUNNING' && (
        <div className="glow-container">
          <div className="glow-effect"></div>
        </div>
      )}
      <div
        className={`model-widget base-regular ${className} relative`}
      >
        {/* This component loads an image only when it is IN VIEWPORT. Tremendously boosts image load performance. */}
        <LazyImage src={model.backgroundImage} alt="" className="w-full h-full absolute inset-0 object-cover" />
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
      { 
        model.error && 
        getErrorButton(model.error)
      }
      { 
        getWidgetButton()
      }
    </div>
  )
}

export default ModelWidget;
