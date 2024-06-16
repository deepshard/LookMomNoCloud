import React, { useCallback, useEffect } from "react";
import { useGetMyModels } from "../../lib/react-query/queriesAndMutations";
import ModelWidget from "../ModelWidget";
import { TModel } from "../../types/schemas";
import Carousel from "../Carousel/Carousel";

interface SearchProps {
  onClose?: () => void;
}

const MyModels = ({ onClose }: SearchProps) => {
  const { data: myModels, isLoading } = useGetMyModels();

  const handlePagination = (data: TModel[]) => {
    const dataCopy = [...data];
    const maxItemsPerPage = 9;
    const pages: TModel[][] = [];

    while (dataCopy.length > 0) {
      pages.push(dataCopy.splice(0, maxItemsPerPage));
    }

    return pages;
  };

  const gridModelsFunc = useCallback(() => {
    return handlePagination(myModels || []);
  }, [myModels]);

  const gridModels = gridModelsFunc();
  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose && onClose();
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, []);
  return (
    <div className="search">
      <img src="/assets/icons/close.svg" alt="" className="absolute z-[9999] cursor-pointer p-[10px] top-[20px] right-[20px]" onClick={onClose} />
      <div className="w-full h-full my-models-container">
        {gridModels.length > 0 && (
          <Carousel easing="linear" waitForAnimate className="w-full h-full">
            {gridModels.map((page, index) => (
              <Page models={page} key={index} />
            ))}
          </Carousel>
        )}
      </div>
    </div>
  );
};

interface PageProps {
  models: TModel[];
}
const Page = ({ models }: PageProps) => {
  return (
    <div className="w-full h-full flex justify-center items-center mx-[145px] pt-[148px]">
      <div className="w-full h-full grid grid-cols-3 gap-x-[140px] gap-y-[52px] justify-items-center content-start">
        {models.map((model) => (
          <ModelWidget type="my-model" model={model} key={model.id} className="w-[124px] h-[78px]" />
        ))}
      </div>
    </div>
  );
};

export default MyModels;
