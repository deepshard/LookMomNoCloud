import React, { useEffect, useState } from 'react'
import { TModel } from '../../types/schemas'
import ModelWidget from '../ModelWidget/ModelWidget'
import SkeletonModelWidget from './skeleton'
import { motion, AnimatePresence } from 'framer-motion'

interface ModelCarouselProps {
  models: TModel[]
  isLoading: boolean
}

const ModelCarousel: React.FC<ModelCarouselProps> = ({ models, isLoading }) => {
  const skeletonCount = 5
  const [displayedModels, setDisplayedModels] = useState<TModel[]>([])

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setDisplayedModels(models)
      }, 500) // Delay to allow skeletons to fade out
      return () => clearTimeout(timer)
    } else {
      setDisplayedModels([])
    }
  }, [isLoading, models])

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex space-x-4 p-4">
        <AnimatePresence>
          {isLoading
            ? Array(skeletonCount)
                .fill(null)
                .map((_, index) => (
                  <SkeletonModelWidget key={`skeleton-${index}`} />
                ))
            : displayedModels.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ModelWidget model={model} className="flex-shrink-0" />
                </motion.div>
              ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ModelCarousel
