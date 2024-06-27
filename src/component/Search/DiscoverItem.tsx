import { useNavigate } from "react-router-dom";
import { TModel } from "../../types/schemas"; // Adjust this import path as needed
import { toUnitOfCount } from "../../utils/sysUtils";
import {LazyLoadImage} from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface DiscoverItemProps {
  model: TModel;
}

const DiscoverItem: React.FC<DiscoverItemProps> = ({ model }) => {
  const navigate = useNavigate();


  const handleNavigate = (model: TModel ) => {
    navigate(`/model/${model.id}`, { state: { model } });
  };

  return (
    <div
      className="relative w-[200px] h-[228px] bg-bg-wdget glass-3d rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition transition-100"
      onClick={() => handleNavigate(model)}
    >
      <div
          className="absolute top-0 left-0 w-full h-full object-cover"
      
      >
        <LazyLoadImage
          effect="blur"
          src={model.lowresBackgroundImage}
          // src="https://picsum.photos/200/300"
          alt={model.title}
          className="w-full h-full object-cover scale-[350%]"
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent z-2" />

      <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col gap-1 justify-end items-start z-3">
        <div className="title-base text-surface-750 -mb-1">{model.title}</div>

        <div className="flex gap-1 text-xs text-surface-500 leading-tight">
          <p>{model.author}</p>
          <p>•</p>
          <div className="flex gap-0.5 items-center">
            <p>{toUnitOfCount(model.downloads)}</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="7"
              height="9"
              viewBox="0 0 7 9"
              fill="none"
            >
              <path
                d="M3.25585 0.5C3.05005 0.5 2.90361 0.652462 2.90361 0.872683V6.45023L2.94319 7.71227L3.16482 7.62758L1.74794 5.9632L0.845565 5.01455C0.786202 4.94679 0.691215 4.91291 0.596228 4.91291C0.398339 4.91291 0.255859 5.07384 0.255859 5.28136C0.255859 5.383 0.291479 5.47194 0.366677 5.55664L2.99068 8.37294C3.06588 8.45762 3.15691 8.5 3.25585 8.5C3.3548 8.5 3.44583 8.45762 3.52103 8.37294L6.14898 5.55664C6.22419 5.47194 6.25586 5.383 6.25586 5.28136C6.25586 5.07384 6.11338 4.91291 5.91548 4.91291C5.82049 4.91291 5.72946 4.94679 5.66614 5.01455L4.76376 5.9632L3.34292 7.62758L3.56852 7.71227L3.6081 6.45023V0.872683C3.6081 0.652462 3.46166 0.5 3.25585 0.5Z"
                fill="white"
                fill-opacity="0.5"
              />
            </svg>
            {/* SVG icon omitted as requested */}
          </div>
        </div>

        <div className="mt-1 text-xs text-surface-500 line-clamp-3">
          {model.intro}
        </div>
      </div>
    </div>
  );
};

export default DiscoverItem;
