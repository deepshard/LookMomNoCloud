import React from "react";
import { TNews } from "../../types/schemas";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface FeaturedProps extends React.HTMLAttributes<HTMLDivElement> {
  news?: TNews;
  isLoading?: boolean;
}

const Featured = ({ news, isLoading = true, className, ...props }: FeaturedProps) => {
  return (
    <div className={`w-full h-[150px] relative overflow-hidden cursor-pointer ${className}`} {...props}>
      <div className="absolute top-0 left-0 p-5 w-full">
        {!isLoading ? <img src={news?.userProfilePicture} alt="" className="w-10 h-10 rounded-xs" /> : <Skeleton className="!w-10 h-10 rounded-xs" />}
        {/* {!isLoading ? <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main">{news?.title}</h3> : <Skeleton className="title-base base-regular mt-[7px] -mb-[1px]" />} */}
        {!isLoading ? (
          <>
            <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main !w-full">{news?.title}</h3>
            <p className="body-sm break-words line-clamp-2 base-regular text-surface-500">{news?.content}</p>
          </>
        ):(
          <Skeleton className="title-base base-regular mt-[7px] -mb-[1px]" count={2}/>
        )}
      </div>
    </div>
  );
};

export default Featured;
