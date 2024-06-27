import Carousel from './Carousel'
import { useHomePageContext } from "../../context/HomePageProvider";


const MyAugmentations = () => {
  return (
    <div className="my-models-container">
      <Placeholder />
    </div>
  )
}

export const Placeholder: React.FC = () => {

  const { setShowAugmentations } = useHomePageContext()

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
        'This augmentation adds Monte Carlo Tree search to LLM generations. It allows your model to explore thought pathways by sampling somewhat randomly, and generating completions & thoughts. This may slow down response times significantly.',
      color: '#4ECDC4',
    },
    {
      id: 3,
      title: 'Jailbreak Model',
      icon: '/src/assets/icons/unlock.svg',
      content: "This augmentation allows your model to become unsafe and generate content that may be harmful or dangerous. Use with caution.",
      color: '#45B7D1',
    },

    {
      id: 4,
      title: 'Genetic Algorithms',
      icon: '/src/assets/icons/twistedarrow.svg',
      content: "This augmentation allows your model to attach a fitness function to it's completions, and evolve over time to generate better and better completions. This can be useful for long term projects, but may slow down response times.",
      color: '#45B7D1',
    },
  ]

  return (
    <div className="placeholder-container" onClick={()=>setShowAugmentations(true)}>
      <Carousel cards={cards} />
    </div>
  )
}

export default MyAugmentations;
