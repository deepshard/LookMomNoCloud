interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  imgClassName?: string;
  text?: string;
}

const Icon = ({ src, text, imgClassName = "", className="", ...props }: IconProps) => (
  <div className={`flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px] hover:bg-opacity-40 transition-colors duration-200, ${className}`} {...props}>
    <img loading="lazy" src={src} className={imgClassName} />
    {text && <p className="text-sm">{text}</p>}
  </div>
);

export default Icon;