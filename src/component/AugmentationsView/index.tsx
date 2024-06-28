import "../Augmentations/index.css";
import LargeCarousel from "./LargeCarousel";
// @ts-ignore
import astarIcon from "../../assets/icons/astar.svg";
// @ts-ignore
import searchIcon from "../../assets/icons/search-icon.svg";
// @ts-ignore
import runningIcon from "../../assets/icons/running-man.svg";
// @ts-ignore
import lockIcon from "../../assets/icons/lock.svg";
// @ts-ignore
import unlockIcon from "../../assets/icons/unlock.svg";
// @ts-ignore
import twistedArrowIcon from "../../assets/icons/twistedarrow.svg";
// @ts-ignore
import mctsIcon from "../../assets/icons/mcts.svg";
// @ts-ignore
import puzzleIcon from "../../assets/icons/puzzle.svg";


const AugmentationsView = () => {
  const cards = [
    {
      id: 1,
      title: "A* Search",
      icon: astarIcon,
      content:
        "This augmentation adds A* search to your model at inference time, making it search for a better answer before responding. This adds time to your completions, but can sometimes unveil interesting insights that wouldn’t normally be predicted",
      color: "#FF6B6B",
      stats: [
        { text: "+10 Smart", imgSrc: searchIcon },
        { text: "-15 Speed", imgSrc: runningIcon },
        { text: "+0 Safety", imgSrc: lockIcon },
      ]
    },
    {
      id: 2,
      title: "MCTS",
      icon: mctsIcon,
      content:
        "This augmentation adds Monte Carlo Tree search to LLM generations. It allows your model to explore thought pathways by sampling somewhat randomly, and generating completions & thoughts. This may slow down response times significantly.",
      color: "#4ECDC4",
      stats: [
        { text: "+10 Smart", imgSrc: searchIcon },
        { text: "-18 Speed", imgSrc: runningIcon },
        { text: "+0 Safety", imgSrc: lockIcon },
      ]
    },
    {
      id: 3,
      title: "Jailbreak Model",
      icon: unlockIcon,
      content: "Pliny the prompter has found a way to jailbreak most models at the cost of safety. This augmentation allows your model to become unsafe and generate content that may be harmful or dangerous. Use with caution.",
      color: "#45B7D1",
      stats: [
        { text: "+1 Smart", imgSrc: searchIcon },
        { text: "+0 Speed", imgSrc: runningIcon },
        { text: "-10 Safety", imgSrc: lockIcon },
      ]
    },

    {
      id: 4,
      title: "Genetic Algorithms",
      icon: twistedArrowIcon,
      content: "This augmentation allows your model to attach a fitness function to its completions, and evolve over time to generate better and better completions. This can be useful for long term projects, but may slow down response times.",
      color: "#45B7D1",
      stats: [
        { text: "+4 Smart", imgSrc: searchIcon },
        { text: "-5 Speed", imgSrc: runningIcon },
        { text: "+0 Safety", imgSrc: lockIcon },
      ]
    }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <LargeCarousel cards={cards} />
      <div className="flex flex-row justify-center items-center bg-surface-fill  gap-2 mt-10">
        <img src={puzzleIcon} alt="puzzle" />
        <h1 className="text-surface-750  text-3xl augmentations-title">
          Augmentations
        </h1>
      </div>
      <div className="flex flex-row justify-center items-center bg-surface-fill  gap-2 -mt-[30px]">
        <h1 className=" mt-10 mb-10 augmentations-title text-surface-500">
          Coming Soon
        </h1>
      </div>
    </div>
  );
};

export default AugmentationsView;
