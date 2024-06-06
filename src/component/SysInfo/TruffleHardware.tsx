import { Button } from "antd";

const TruffleHardware = () => {
    const truffleHardwareImage = process.env.NODE_ENV === "development" ? "/assets/icons/truffle-hardware.svg" : "../../renderer/main_window/assets/icons/truffle-hardware.svg";
  return (
    <div className="col-span-1 w-full h-full ">
      <div className="flex flex-col w-full h-full">
        <div className="w-full h-full flex justify-center flex-1 ">
          <img src={truffleHardwareImage} alt="" className="self-end" />
        </div>
        <div className="flex w-full h-[45%] border-t-[0.9px] border-t-white/30 radial-gradient from-[#d9d9d9]/50 from-[20%] via-[#d9d9d9]/45 via-30% to-[#D9D9D94D]/30 to-[60%]">
          <Button type="primary" className="preorder-btn self-end m-[13px] h-[40px] w-full bg-[#817f7f] text-white">
            <span className="base-medium ">Pre Order Truffle–1</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TruffleHardware;
