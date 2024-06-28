import React from "react";
import { TNews } from "../../types/schemas";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface FeaturedProps extends React.HTMLAttributes<HTMLDivElement> {
  news?: TNews;
  isLoading?: boolean;
}

const Featured = ({ news, isLoading = true, className, ...props }: FeaturedProps) => {
  const getTitle = () => {
    const lenTitle = news?.title.length || 0;
    if (lenTitle > 40) {
      return news?.title.slice(0, 40) + "...";
    }

    return news?.title;
  }

  const getContent = () => {
    const lenContent = news?.content.length || 0;
    if (lenContent > 100) {
      return news?.content.slice(0, 100) + "...";
    }

    return news?.content;
  }

  return (
    <div className={`w-full h-[150px] relative overflow-hidden cursor-pointer outline-none ${className}`} {...props}>
      <div className="absolute top-0 left-0 p-5 w-full">
        {!isLoading ? <img src={news?.userProfilePicture} alt="" className="w-10 h-10 rounded-xs" onError={() => console.log("error")}/> : <Skeleton className="!w-10 h-10 rounded-xs opacity-10" />}
        {!isLoading ? (
          <>
            <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main !w-full line-clamp-1">{getTitle()}</h3>
            <p className="body-sm break-words line-clamp-2 base-regular text-surface-500">{getContent()}</p>
          </>
        ):(
          <Skeleton className="title-base base-regular mt-[7px] -mb-[1px] opacity-10" count={2}/>
        )}
      </div>
    </div>
  );
};

export default Featured;
