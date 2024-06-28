import React, { useCallback, useRef } from "react";
import Carousel from "../Carousel/Carousel";
import Featured from "../Featured";
import { useGetNews } from "../../lib/react-query/queriesAndMutations";

const FeaturedCarousel = () => {
  const carouselRef = useRef<any>();
  const { data: news, isFetching: isGettingNews } = useGetNews();
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
        autoplay={!isGettingNews}
        easing="linear"
        waitForAnimate
        className="w-80 h-[150px] widget-3d outline-none">
        {news.slice(0, 5).map((item) => (
          <Featured key={item.id} news={item} isLoading={isGettingNews} onClick={() => {
            if(isGettingNews) return;
            //@ts-ignore
            window.electronShell.openExternal(item.url);
          }}/>
        ))}
      </Carousel>
    </div>
  );
};

export default FeaturedCarousel;
