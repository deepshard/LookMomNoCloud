// ModelCarousel.tsx
import React, { useState, useEffect } from 'react'
import { TModel } from '../../types/schemas'
import ModelWidget from '../ModelWidget/ModelWidget'
import SkeletonModelWidget from './skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'

interface ModelCarouselProps {
  models: TModel[]
  isLoading: boolean
}

const ModelCarousel: React.FC<ModelCarouselProps> = ({ models, isLoading }) => {
  const skeletonCount = 5
  const [showModels, setShowModels] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowModels(true), 300)
      return () => clearTimeout(timer)
    } else {
      setShowModels(false)
    }
  }, [isLoading])

  return (
    <div className="model-carousel">
      <div className="model-carousel-inner">
        {(isLoading || !showModels) && 
          Array(skeletonCount).fill(null).map((_, index) => (
            <div key={`skeleton-wrapper-${index}`} className="model-item-wrapper">
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
          ))
        }
        {showModels && models.map((model, index) => (
          <div key={`model-wrapper-${model.id}`} className="model-item-wrapper">
            <AnimatePresence>
              <motion.div
                key={model.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ModelWidget model={model} className="flex-shrink-0" />
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModelCarousel;