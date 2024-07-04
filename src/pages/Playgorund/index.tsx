import ModelCarousel from "../../component/ModelCarousel";
import { useAppStore } from "../../store/store";
// @ts-ignore
import discoverVid from "../../assets/videos/discover-vid.mp4";
import { useHomePageContext } from "../../context/HomePageProvider";
import { Input } from "antd";
import "./Playground.css";
// @ts-ignore
import plusIcon from "../../assets/icons/plus.svg";
// @ts-ignore
import sendIcon from "../../assets/icons/send-fill.svg";

interface PlaygroundProps extends React.HTMLAttributes<HTMLDivElement> {}

const Playground = ({ className = "", ...props }: PlaygroundProps) => {
  const { highlights, downloads } = useAppStore();
  const { setShowSearch, setShowDiscover } = useHomePageContext();

  console.log(downloads)

  if (Object.keys(downloads).length === 0) {
    return (
      <div className={`w-full h-full flex items-center flex-col backdrop-blur-[50px] px-[145px] pb-[17px] ${className}`} {...props}>
        <h1 className="heading-lg mt-[171px]">Welcome to LMNC™ Playground</h1>
        <p className="text-[16px] text-surface-500">Get started by downloading and running a model</p>
        <ModelCarousel models={highlights} className="mt-[60px] w-full flex-center" />
        <div
          className="flex-center gap-[6px] cursor-pointer bg-white/5 p-[8px] rounded-md mt-[62px]"
          onClick={() => {
            setShowDiscover(true);
            setShowSearch(true);
          }}>
          <video autoPlay loop muted className="aspect-square w-[18px] object-cover rounded-full saturate-0 brightness-125">
            <source src={discoverVid} type="video/mp4" />
          </video>

          <p className="text-sm text-surface-500">Discover More Models</p>
        </div>
        <div className="w-full rounded-md overflow-hidden bg-surface-100 p-2 flex items-end mt-auto">
          <span className="h-8 flex-center">
            <img src={plusIcon} alt="" className="w-6 h-6" />
          </span>
          <Input.TextArea autoSize className="" placeholder="Chat with Llama-3..." />
          <span className="h-8 flex-center">
            <img src={sendIcon} alt="" className="w-6 h-6" />
          </span>
        </div>
      </div>
    );
  }

  return <>
    To:do user has model
  </>;
};

export default Playground;
