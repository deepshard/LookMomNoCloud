interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  imgSrc?: string;
  text: string | number;
}

const Tag = ({ imgSrc, text, className = "", ...props }: TagProps) => {
  return (
    <div className={`flex gap-2 py-1 pr-2.5 pl-1.5 whitespace-nowrap bg-surface-100 rounded-full justify-center items-center ${className}`} {...props}>
      {imgSrc && <img loading="lazy" src={imgSrc} className="shrink-0 my-auto w-3.5 aspect-[1.08]" />}
      <div>{text}</div>
    </div>
  );
};

export default Tag;