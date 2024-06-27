interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  imgClassName?: string;
}

const Icon = ({ src, imgClassName = "", className="", children, ...props }: IconProps) => (
  <div className={`flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px] hover:bg-opacity-[15%] transition-colors duration-200, ${className}`} {...props}>
    {src && <img loading="lazy" src={src} className={imgClassName} />}
    {/* {text && <p className="text-sm">{text}</p>} */}
    {children}
  </div>
);

export default Icon;