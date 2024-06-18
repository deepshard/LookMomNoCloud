interface ScrollingTextProps {
  text: string;
  isHovered: boolean;
}
const ScrollingText: React.FC<ScrollingTextProps> = ({ text, isHovered }) => {
  return (
    <div className={`clip-rectangle ${text.length > 11 ? 'truncate' : ''}`}>
      <div className={`scrolling-text ${isHovered && text.length > 10  ? 'scrolling' : ''}`}>
        {text}
        <style jsx>{`
          .clip-rectangle {
            overflow: hidden;
          }
          .truncate {
            width: 12ch;
          }
          .scrolling-text {
            white-space: nowrap;
            display: inline-block;
            transform: translateX(0);
            text-overflow: ellipsis; // This will add "..." when the text overflows
            overflow: hidden; // This is necessary for text-overflow to work
          }
          .scrolling {
            animation: scroll 5s ease-out infinite;
          }
          @keyframes scroll {
            0%, 100% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(-45%);
            }
          }
        `}</style>
      </div>
    </div>
  );
};


export default ScrollingText;