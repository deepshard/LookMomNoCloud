import React, { useState, useEffect, FC, CSSProperties } from "react";
import "./index.css";
// @ts-ignore
import puzzleIcon from "../../assets/icons/puzzle.svg";

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
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, [cards.length]);

  const getCardStyle = (index: number): CSSProperties => {
    const totalCards = cards.length;
    const anglePerCard = 360 / totalCards;

    // Calculate the shortest angular distance
    let angleDiff =
      ((index - activeIndex + totalCards) % totalCards) * anglePerCard;
    if (angleDiff > 180) angleDiff -= 360;

    const radius = 80; // Increased radius to spread cards out more

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
      }deg) scale(${scale * 1.3})`,
      zIndex: totalCards - Math.abs(angleDiff),
      opacity: opacity,
      pointerEvents: Math.abs(angleDiff) <= anglePerCard ? "auto" : "none",
      backgroundColor: "#5B5B5B",
    };

    return baseStyle;
  };

  return (
    <>
      <div className="carousel-container">
        <div className="carousel-backdrop widget-3d"></div>
        <div
          className="carousel-content"
          style={{
            transformStyle: "preserve-3d",
            perspective: "400px",
            transform: "translateZ(-50px)", // Move the carousel back slightly
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
                  <h3 className="card-title text-surface-main">{card.title}</h3>
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
      <div className="absolute flex justify-center items-center w-[360px] mt-[10px] gap-[8px]">
        <img src={puzzleIcon} alt="puzzle" className="w-[15px] h-[9px] opacity-75"/>
        <h1
        className="text-surface-500 text-[14px]"
        >Augmentations</h1>
      </div>
    </>
  );
};

export default Carousel;
