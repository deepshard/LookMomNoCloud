
// FeaturedModels.jsx
import React from "react";
import ModelWidget from "../ModelWidget";

const FeaturedModels = ({ featuredModels }) => (
  <div className="w-full grid grid-cols-4 justify-between gap-x-[54px] gap-y-11">
    {featuredModels?.map((model) => (
      <ModelWidget
        model={model}
        key={model.id}
        className="w-[124px] h-[78px]"
      />
    ))}
  </div>
);

export default FeaturedModels;
