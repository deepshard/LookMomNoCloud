import React from 'react';
import { TModel } from '../../types/schemas';
import ModelWidget from '../ModelWidget/ModelWidget';
import SkeletonModelWidget from './skeleton'; // We'll create this next

interface ModelCarouselProps {
  models: TModel[];
  isLoading: boolean;
}

const ModelCarousel: React.FC<ModelCarouselProps> = ({ models, isLoading }) => {
  const skeletonCount = 5; // Number of skeleton widgets to show while loading

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex space-x-4 p-4">
        {isLoading
          ? Array(skeletonCount)
              .fill(null)
              .map((_, index) => <SkeletonModelWidget key={index} />)
          : models.map((model) => (
              <ModelWidget
                key={model.id}
                model={model}
                className="flex-shrink-0"
              />
            ))}
      </div>
    </div>
  );
};

export default ModelCarousel;