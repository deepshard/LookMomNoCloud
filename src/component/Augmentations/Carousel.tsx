import { useState, useEffect, FC } from 'react'
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
    }, 3000) // Change slide every 3 seconds
    return () => clearInterval(interval)
  }, [cards.length])

  const getCardStyle = (index: number): string => {
    const diff = (index - activeIndex + cards.length) % cards.length
    if (diff === 0) return 'card active'
    if (diff === 1) return 'card next'
    if (diff === cards.length - 1) return 'card prev'
    return 'card'
  }

  return (
    <div className="carousel-container">
      <div className="carousel-backdrop widget-3d"></div>
      <div className="carousel-content">
        {cards.map((card, index) => (
          <div key={card.id} className={`${getCardStyle(index)} cursor-pointer`}>
            <div className="card-content glass-3d">
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

export default Carousel;
