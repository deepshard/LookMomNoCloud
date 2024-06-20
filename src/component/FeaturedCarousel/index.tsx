import React, { useCallback, useRef, useState } from "react";
import Carousel from "../Carousel/Carousel";
import Featured from "../Featured";

const FeaturedCarousel = () => {
  const carouselRef = useRef<any>();
  const next = () => {
    carouselRef.current.next();
  };

  const prev = () => {
    carouselRef.current.prev();
  };

  const handleWheel = useCallback((event) => {
    const threshold = 30;
    // Check if the horizontal scroll delta exceeds the threshold
    if (event.deltaX > threshold) {
      next();
    } else if (event.deltaX < -threshold) {
      prev();
    }
  }, []);
  return (
    <div onWheel={handleWheel}>
      <Carousel
        ref={carouselRef}
        autoplay
        easing="linear"
        waitForAnimate
        className="w-80 h-[150px] widget-3d">
        <Featured />
        <Featured />
      </Carousel>
    </div>
  );
};

export default FeaturedCarousel;
