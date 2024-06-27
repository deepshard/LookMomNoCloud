import { FC, useEffect, useState, CSSProperties } from "react";
import '../Augmentations/index.css'
import Tag from '../Tag'



interface LargeCarouselProps {
    cards: {
      id: number;
      title: string;
      icon: string;
      content: string;
      stats?: { text: string; imgSrc: string}[];
    }[];
  }
  
  const LargeCarousel: FC<LargeCarouselProps> = ({ cards }) => {
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
  
      const radius = 120; // Increased radius to spread cards out more
  
      // Calculate the position on the circle
      const x = Math.sin((angleDiff * Math.PI) / 180) * radius;
      const z = Math.cos((angleDiff * Math.PI) / 180) * radius - radius;
  
      // Calculate opacity and scale based on distance from active card
      const distance = Math.abs(angleDiff) / anglePerCard;
      const scale = Math.max(0.7, 1 - distance * 0.1);
  
      const baseStyle: CSSProperties = {
        position: "absolute",
        width: "388px",
        height: "240px",
        borderRadius: "32px",
        transition: "all 0.5s ease",
        color: "white",
        overflow: "hidden",
        transform: `translateX(${x}px) translateZ(${z}px) rotateY(${
          -angleDiff / 2
        }deg) scale(${scale})`,
        zIndex: totalCards - Math.abs(angleDiff),
        opacity: index === activeIndex ? 1 : 0.5,
        pointerEvents: Math.abs(angleDiff) <= anglePerCard ? "auto" : "none",
        backgroundColor: 'rgba(108, 108, 108, 1)',
        backdropFilter: "blur(60px)",
        padding: "20px",
        boxShadow: "0px 4.486px 33.645px 0px rgba(255, 255, 255, 0.15) inset, 0px -4.486px 22.43px 0px rgba(85, 85, 85, 0.10) inset, 0px 0px 10.066px 0px rgba(255, 255, 255, 0.10) inset, 0px 0px 16.822px 0px rgba(85, 85, 85, 0.10)",
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
              <div className="card-content bg-surface-fill">
                <div className="card-header mb-[10px]">
                  <img src={card.icon} className="w-[16px] h-[13px]" alt="icon" />
                  <h3 className="large-card-title text-surface-main ml-[3px]">{card.title}</h3>
                </div>
                <div className="card-divider"></div>
                <p className="large-card-description text-surface-500">
                  {card.content}
                </p>
                <div className="flex w-full justify-between content-end mt-[10px]">
                  {card.stats?.map((stat, index) => (
                    <Tag key={index} imgSrc={stat.imgSrc} text={stat.text} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default LargeCarousel;