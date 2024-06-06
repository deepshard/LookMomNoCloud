
const CustomCarouselDot = ({ onClick, ...rest }: any) => {
  const {
    active,
  } = rest;
  return <button onClick={onClick} className={`w-[6.281px] h-[6.281px] mx-[6.28px] ${active ? "bg-white/50" : "bg-[#D9D9D94D]"} rounded-full`} />;
};

export default CustomCarouselDot;
