import React, { useState, useEffect, FC, CSSProperties } from "react";
import "../Augmentations/index.css";
import "../../assets/icons/puzzle.svg";

const AugmentationsView = () => {
  const cards = [
    {
      id: 1,
      title: "A* Search",
      icon: "/src/assets/icons/astar.svg",
      content:
        "A* Search is an inference time model enhahncement technique that uses a heuristic to efficiently find an optimal path to the best solution.",
      color: "#FF6B6B",
    },
    {
      id: 2,
      title: "MCTS",
      icon: "/src/assets/icons/mcts.svg",
      content:
        "Monte carlo tree search uses the monte carlo property of random generations to find the best solution to a problem.",
      color: "#4ECDC4",
    },
    {
      id: 3,
      title: "Jailbreak Model",
      icon: "/src/assets/icons/unlock.svg",
      content: "And this is what's in the third card",
      color: "#45B7D1",
    },

    {
      id: 4,
      title: "Genetic Algorithms",
      icon: "/src/assets/icons/mcts.svg",
      content: "And this is what's in the third card",
      color: "#45B7D1",
    },

    {
      id: 5,
      title: "Genetic Algorithms",
      icon: "/src/assets/icons/unlock.svg",
      content: "And this is what's in the third card",
      color: "#45B7D1",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Carousel cards={cards} />
      <div className="flex flex-row justify-center items-center bg-surface-fill  gap-2 ">
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

interface CarouselProps {
  cards: {
    id: number;
    title: string;
    icon: string;
    content: string;
  }[];
}

const Carousel: FC<CarouselProps> = ({ cards }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % cards.length);
    }, 1000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, [cards.length]);

  const getCardStyle = (index: number): CSSProperties => {
    const totalCards = cards.length;
    const anglePerCard = 360 / totalCards;

    // Calculate the shortest angular distance
    let angleDiff =
      ((index - activeIndex + totalCards) % totalCards) * anglePerCard;
    if (angleDiff > 180) angleDiff -= 360;

    const radius = 120; // Increased radius to spread cards out more

    // Calculate the position on the circle
    const x = Math.sin((angleDiff * Math.PI) / 180) * radius;
    const z = Math.cos((angleDiff * Math.PI) / 180) * radius - radius;

    // Calculate opacity and scale based on distance from active card
    const distance = Math.abs(angleDiff) / anglePerCard;
    const opacity = 1;
    const scale = Math.max(0.7, 1 - distance * 0.1);

    const baseStyle: CSSProperties = {
      position: "absolute",
      width: "135px",
      height: "83px",
      transition: "all 0.5s ease",
      borderRadius: "13px",
      color: "white",
      overflow: "hidden",
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${
        -angleDiff / 2
      }deg) scale(${scale * 2})`,
      zIndex: totalCards - Math.abs(angleDiff),
      opacity: opacity,
      pointerEvents: Math.abs(angleDiff) <= anglePerCard ? "auto" : "none",
      backgroundColor: "gray",
    };

    return baseStyle;
  };

  return (
    <div className="">
      <div className=""></div>
      <div
        className="carousel-content"
        style={{
          height: "250px",
          position: "relative",
          transformStyle: "preserve-3d",
          perspective: "400px",
          transform: "translateZ(500px)", // Move the carousel back slightly
        }}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            style={getCardStyle(index)}
            className="cursor-pointer"
          >
            <div className="card-content glass-3d bg-surface-fill">
              <div className="card-header">
                <img src={card.icon} className="icon" alt="icon" />
                <h3 className="card-title">{card.title}</h3>
              </div>
              <div className="card-divider"></div>
              <p className="card-description text-surface-500">
                {card.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
