interface ScrollingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  isHovered: boolean;
}
const ScrollingText: React.FC<ScrollingTextProps> = ({ text, isHovered, ...props }) => {
  return (
    <div className={`clip-rectangle ${text.length > 11 ? 'truncate' : ''}`} {...props}>
      <div className={`scrolling-text ${isHovered && text.length > 10  ? 'scrolling' : ''}`}>
        {text}
      </div>
    </div>
  );
};


export default ScrollingText;