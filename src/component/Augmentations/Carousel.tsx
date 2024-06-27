import React, { useState, useEffect, FC, CSSProperties } from 'react'
import './index.css'

interface CarouselProps {
  cards: {
    id: number
    title: string
    icon: string
    content: string
  }[]
}

const Carousel: FC<CarouselProps> = ({ cards }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % cards.length)
    }, 1000) // Change slide every 3 seconds
    return () => clearInterval(interval)
  }, [cards.length])

  const getCardStyle = (index: number): CSSProperties => {
    const totalCards = cards.length
    const anglePerCard = 360 / totalCards
    
    // Calculate the shortest angular distance
    let angleDiff = ((index - activeIndex + totalCards) % totalCards) * anglePerCard
    if (angleDiff > 180) angleDiff -= 360

    const radius = 100 // Increased radius to spread cards out more
    const maxVisibleCards = 5 // Number of cards visible on each side

    // Calculate the position on the circle
    const x = Math.sin(angleDiff * Math.PI / 180) * radius
    const z = Math.cos(angleDiff * Math.PI / 180) * radius - radius

    // Calculate opacity and scale based on distance from active card
    const distance = Math.abs(angleDiff) / anglePerCard
    const opacity = 1
    const scale = Math.max(0.7, 1 - distance * 0.1)

    const baseStyle: CSSProperties = {
      position: 'absolute',
      width: '135px',
      height: '83px',
      transition: 'all 0.5s ease',
      borderRadius: '13px',
      color: 'white',
      overflow: 'hidden',
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${-angleDiff}deg) scale(${scale*1.3})`,
      zIndex: totalCards - Math.abs(angleDiff),
      opacity: opacity,
      pointerEvents: Math.abs(angleDiff) <= anglePerCard ? 'auto' : 'none',
      backgroundColor: 'gray',
    }

    return baseStyle
  }

  return (
    <div className="carousel-container">
      <div className="carousel-backdrop widget-3d"></div>
      <div className="carousel-content" style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        transform: 'translateZ(-50px)', // Move the carousel back slightly
      }}>
        {cards.map((card, index) => (
          <div key={card.id} style={getCardStyle(index)} className="cursor-pointer">
            <div className="card-content glass-3d bg-surface-fill">
              <div className="card-header">
                <img src={card.icon} className='icon' alt="icon" />
                <h3 className="card-title">{card.title}</h3>
              </div>
              <div className="card-divider"></div>
              <p className="card-description text-surface-500">{card.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Carousel