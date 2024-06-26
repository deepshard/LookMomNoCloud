import { useCallback, useEffect, useRef } from 'react'
import { CarouselProps } from 'antd'
import { TModel } from '../../types/schemas'
import Carousel from './Carousel'

interface SearchProps {
  myModels?: TModel[]
  onModelClick?: (model: TModel) => void
}

const MyAugmentations = ({ myModels = [], onModelClick }: SearchProps) => {

  return (
    <div className="my-models-container">
      <Placeholder />
    </div>
  )
}

interface PageProps {
  models: TModel[]
  onModelClick?: (model: TModel) => void
}
const Page = ({ models, onModelClick }: PageProps) => {
  return (
    <div className="w-full h-full flex justify-center items-center mx-[145px] pt-[148px]"></div>
  )
}

export const Placeholder: React.FC = () => {
  const cards = [
    {
      id: 1,
      title: 'A* Search',
      icon: '/src/assets/icons/astar.svg',
      content:
        'A* Search is an inference time model enhahncement technique that uses a heuristic to efficiently find an optimal path to the best solution.',
      color: '#FF6B6B',
    },
    {
      id: 2,
      title: 'MCTS',
      icon: '/src/assets/icons/mcts.svg',
      content:
        'Monte carlo tree search uses the monte carlo property of random generations to find the best solution to a problem.',
      color: '#4ECDC4',
    },
    {
      id: 3,
      title: 'Jailbreak Model',
      icon: '/src/assets/icons/unlock.svg',
      content: "And this is what's in the third card",
      color: '#45B7D1',
    },
  ]

  return (
    <div className="placeholder-container">
      <Carousel cards={cards} />
    </div>
  )
}

export default MyAugmentations;
