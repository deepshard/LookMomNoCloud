// ModelCarousel.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { TModel } from '../../types/schemas'
import ModelWidget from '../ModelWidget'
import SkeletonModelWidget from './ModelWidgetSkeleton'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import { useAppStore } from '../../store/store'
import { canFitOnMachine } from '../../utils/sysUtils'

interface ModelCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  models: TModel[]
  isLoading: boolean
  installModel: (...args: any) => void
  runModels: (...args: any) => void
  stopModel: (...args: any) => void
  cleanupInstall: (...args: any) => void
  onModelClick: (...args: any) => void
}

const getSortValue = (status: string) => {
  switch (status) {
    case 'RUNNING':
      return 0
    case 'ACKNOWLEDGED':
      return 1
    case 'DOWNLOADING':
      return 2
    case 'INSTALLING':
      return 3
    case 'STOPPED':
      return 4
    case 'NOT_DOWNLOADED':
      return 5
    default:
      return 5
  }
}

const ModelCarousel: React.FC<ModelCarouselProps> = ({ models, isLoading, installModel, runModels, stopModel, cleanupInstall, onModelClick, className='', ...props  }) => {
  const skeletonCount = 5
  const { sysInfo } = useAppStore();
  const [showModels, setShowModels] = useState(false)
  const carouselInnerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowModels(true)
        // Adjust the inner container's height after transition
        if (carouselInnerRef.current) {
          carouselInnerRef.current.style.minHeight = `${carouselInnerRef.current.scrollHeight}px`
        }
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowModels(false)
      // Reset the inner container's height
      if (carouselInnerRef.current) {
        carouselInnerRef.current.style.minHeight = '110px'
      }
    }
  }, [isLoading])

  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => {
      return getSortValue(a.status) - getSortValue(b.status)
    })
  }, [models])

  return (
    <div className={`model-carousel custom-scrollbar ${className}`} {...props}>
      <div className="model-carousel-inner">
        {(isLoading || !showModels) &&
          Array(skeletonCount)
            .fill(null)
            .map((_, index) => (
              <div
                key={`skeleton-wrapper-${index}`}
                className="model-item-wrapper"
              >
                <AnimatePresence>
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SkeletonModelWidget />
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
        <AnimatePresence>
          {showModels &&
            [...sortedModels, ...sortedModels].map((model) => (
              <motion.div
                key={`model-wrapper-${model.id}`}
                className="model-item-wrapper"
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  duration: 0.5,
                }}
              >
                <ModelWidget
                  key={`${model.id}`}
                  model={model}
                  disabled={!canFitOnMachine(model.size, sysInfo?.resources.total.ram || 0, sysInfo?.resources.available.disk || 0)}
                  className="flex-shrink-0"
                  onClick={() => onModelClick(model)}
                  onInstall={() => installModel(model)}
                  onRun={() => runModels(model)}
                  onStop={() => stopModel(model)}
                  onCleanup={() => cleanupInstall(model)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ModelCarousel
