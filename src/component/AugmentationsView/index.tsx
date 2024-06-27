import "../Augmentations/index.css";
import LargeCarousel from "./LargeCarousel";

const AugmentationsView = () => {
  const cards = [
    {
      id: 1,
      title: "A* Search",
      icon: "/src/assets/icons/astar.svg",
      content:
        "This augmentation adds A* search to your model at inference time, making it search for a better answer before responding. This adds time to your completions, but can sometimes unveil interesting insights that wouldn’t normally be predicted",
      color: "#FF6B6B",
      stats: [
        { text: "+10 Smart", imgSrc: "/src/assets/icons/search-icon.svg" },
        { text: "-15 Speed", imgSrc: "/src/assets/icons/running-man.svg" },
        { text: "+0 Safety", imgSrc: "/src/assets/icons/lock.svg" },
      ]
    },
    {
      id: 2,
      title: "MCTS",
      icon: "/src/assets/icons/mcts.svg",
      content:
        "This augmentation adds Monte Carlo Tree search to LLM generations. It allows your model to explore thought pathways by sampling somewhat randomly, and generating completions & thoughts. This may slow down response times significantly.",
      color: "#4ECDC4",
      stats: [
        { text: "+10 Smart", imgSrc: "/src/assets/icons/search-icon.svg" },
        { text: "-18 Speed", imgSrc: "/src/assets/icons/running-man.svg" },
        { text: "+0 Safety", imgSrc: "/src/assets/icons/lock.svg" },
      ]
    },
    {
      id: 3,
      title: "Jailbreak Model",
      icon: "/src/assets/icons/unlock.svg",
      content: "Pliny the prompter has found a way to jailbreak most models at the cost of safety. This augmentation allows your model to become unsafe and generate content that may be harmful or dangerous. Use with caution.",
      color: "#45B7D1",
      stats: [
        { text: "+1 Smart", imgSrc: "/src/assets/icons/search-icon.svg" },
        { text: "+0 Speed", imgSrc: "/src/assets/icons/running-man.svg" },
        { text: "-10 Safety", imgSrc: "/src/assets/icons/lock.svg" },
      ]
    },

    {
      id: 4,
      title: "Genetic Algorithms",
      icon: "/src/assets/icons/twistedarrow.svg",
      content: "This augmentation allows your model to attach a fitness function to its completions, and evolve over time to generate better and better completions. This can be useful for long term projects, but may slow down response times.",
      color: "#45B7D1",
      stats: [
        { text: "+4 Smart", imgSrc: "/src/assets/icons/search-icon.svg" },
        { text: "-5 Speed", imgSrc: "/src/assets/icons/running-man.svg" },
        { text: "+0 Safety", imgSrc: "/src/assets/icons/lock.svg" },
      ]
    }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <LargeCarousel cards={cards} />
      <div className="flex flex-row justify-center items-center bg-surface-fill  gap-2 mt-10">
        <img src="src/assets/icons/puzzle.svg" alt="puzzle" />
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
