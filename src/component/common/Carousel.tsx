import { AnimatePresence, motion } from 'framer-motion'
import React, { useState, useEffect, useRef } from 'react';

interface CarouselProps {
    items: JSX.Element[];
    autoplay?: boolean;
    interval?: number; // Autoplay interval in milliseconds
    showArrows?: boolean;
}

const variants = {
    initial: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        // scale: 0.5,
      }
    },
    animate: {
      x: 0,
      opacity: 1,
      // scale: 1,
      // transition: 'ease-in',
      transition: {
        x: { type: 'ease-in', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => {
      return {
        x: direction > 0 ? -1000 : 1000,
        opacity: 0,
        // scale: 0.5,
        // transition: 'ease-in',
        transition: {
          x: { type: 'ease-in', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        },
      }
    },
  }

const Carousel: React.FC<CarouselProps> = ({ items, autoplay = false, interval = 3000, showArrows = false }) => {
    const [index, setIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    function nextStep() {
        setTimeout(() => {
            
            setDirection(1)
            if (index === items.length - 1) {
                setIndex(0)
                return
            }
            setIndex(index + 1)
        }, 200);
    }

    function prevStep() {
        setTimeout(() => {
            
            setDirection(-1)
            if (index === 0) {
                setIndex(items.length - 1)
                return
            }
            setIndex(index - 1)
        }, 200);
    }

    // i want autoplay
    useEffect(() => {
        if (autoplay) {
            const intervalId = setInterval(() => {
                nextStep()
            }, interval);
            return () => clearInterval(intervalId);
        }
    }, [index]);

    return (
        <div className='w-full h-full'>
          <div className='m-auto w-full h-full relative overflow-hidden'>
            <AnimatePresence initial={true} custom={direction}>
              {/* <motion.img
                variants={variants}
                animate='animate'
                initial='initial'
                exit='exit'
                src={images[index]}
                alt='slides'
                className='slides'
                key={images[index]}
                custom={direction}
              /> */}
                <motion.div
                  variants={variants}
                  animate='animate'
                  initial='initial'
                  exit='exit'
                  className='absolute w-full h-full'
                  key={items[index].key}
                  custom={direction}
                >
                  {items[index]}
                </motion.div>
            </AnimatePresence>
            {showArrows && (
              <div className='absolute top-[50%] translate-y-[-50%]'>
                <button className='bg-red-500 p-3' onClick={prevStep}>
                  ◀
                </button>
                <button className='bg-red-500 p-3' onClick={nextStep}>
                  ▶
                </button>
              </div>
            )}
          </div>
        </div>
    )
};

export default Carousel;