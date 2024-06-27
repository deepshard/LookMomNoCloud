import React from "react";
import { useNavigate } from "react-router-dom";
import ModelWidget from "../ModelWidget";
import { TModel } from "../../types/schemas"; // Adjust this import path as needed

interface FeaturedModelsProps {
  featuredModels: TModel[];
}

const FeaturedModels: React.FC<FeaturedModelsProps> = ({ featuredModels }) => {
  const navigate = useNavigate();

  const handleNavigate = (model: TModel) => {
    navigate(`/model/${model.id}`, { state: { model } });
  };

  return (
    <div className="w-full grid grid-cols-4 justify-between gap-x-[54px] gap-y-11">
      {featuredModels?.map((model) => (
        <ModelWidget
          model={model}
          key={model.id}
          className="w-[124px] h-[78px]"
          onClick={() => handleNavigate(model)}
        />
      ))}
    </div>
  );
};

export default FeaturedModels;