import {Carousel as AntdCarousel, CarouselProps as AntdCarouselProps} from 'antd'
import { CarouselRef } from 'antd/es/carousel'
import { forwardRef, } from 'react';

const Carousel = forwardRef<CarouselRef, AntdCarouselProps>(({children, className, ...props}, ref) => {
  return (
    <AntdCarousel
      ref={ref}
      {...props} 
      className={`text-surface-750 ${className}`}
    >
      {children}
    </AntdCarousel>
  )
})

export default Carousel