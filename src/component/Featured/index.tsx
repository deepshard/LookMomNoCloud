import React from "react";

interface FeaturedProps extends React.HTMLAttributes<HTMLDivElement> {
  link?: string;
}

const Featured = ({className, ...props}: FeaturedProps) => {
  return (
    <div className={`w-full h-[150px] relative overflow-hidden ${className}`} {...props}>
      <div className="absolute top-0 left-0 p-5">
        <img src="/assets/images/llama1.png" alt="" className="discover-model-img w-10 h-10 rounded-xs" />
        <h3 className="title-base base-regular mt-[7px] -mb-[1px] text-surface-main">DeepSeek</h3>
        <p className="body-sm break-words line-clamp-2 base-regular text-surface-500">
          lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing
          elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam
          vulputate consectetur etiam consectetur lorem ipsum dolor sit amet consectetur adipiscing elit etiam consectetur elementum mattis aliquam vulputate consectetur etiam consectetur
        </p>
      </div>
    </div>
  );
};

export default Featured;
