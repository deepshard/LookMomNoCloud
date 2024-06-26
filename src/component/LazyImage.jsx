
import React, { useEffect, useRef, useState } from "react";

// This component loads an image only when it is IN VIEWPORT. Tremendously boosts image load performance.


const LazyImage = ({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef();
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.unobserve(imgRef.current);
          }
        },
        {
          rootMargin: "100px",
        }
      );
  
      if (imgRef.current) {
        observer.observe(imgRef.current);
      }
  
      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    }, []);
  
    return (
      <div ref={imgRef} className={className}>
        {isLoaded ? (
          <img src={src} alt={alt} className={className} />
        ) : (
          <div className={`${className} bg-gray-200 animate-pulse`} />
        )}
      </div>
    );
  };

export default LazyImage;