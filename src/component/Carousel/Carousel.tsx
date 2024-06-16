import {Carousel as AntdCarousel, CarouselProps as AntdCarouselProps} from 'antd'

const Carousel = ({children, className, ...props}: AntdCarouselProps) => {
  return (
    <AntdCarousel 
      {...props} 
      className={`text-surface-750 ${className}`}
    >
      {children}
    </AntdCarousel>
  )
}

export default Carousel