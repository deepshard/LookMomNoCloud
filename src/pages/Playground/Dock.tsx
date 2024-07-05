// @ts-ignore
import Icon from "../../component/Icon";
import closeIcon from "../../assets/icons/close.svg";
import Close from "../../icons/Close";
import { Image } from ".";

interface DockProps {
  images: Image[];
  deleteImage: (id: string) => void;
}

const Dock = ({ images, deleteImage }: DockProps) => {
  if (images.length == 0) {
    return <></>
  }

  return (
    <div className="relative w-full h-[60px] mt-5">
      {/* Dock */}
      <div className="trapezoid absolute bottom-0 mb-[10px]"></div>

      {/* Images */}
      <div className="absolute bottom-[20px] flex gap-2.5 px-4">
          {images.map((image, index) => (
            <div key={index} className="relative w-[50px] h-[50px]">
              <img src={image.url} alt={`image-${index}`} className="w-full h-full object-cover rounded-xs shadow-md" />
              <div
                className="absolute top-[-4px] left-[-4px] flex items-center justify-center bg-white/10 hover:bg-white/25 rounded-full w-[14px] h-[14px]"
                onClick={() => deleteImage(image.id)}
              >
                <Close height={6} width={6} className="fill-surface-750" />
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}

export default Dock;
