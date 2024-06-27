export default ({ height, width, onClick, className="" }: { height: number, width: number, onClick?: () => void, className?: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick} className={`...? ${className}`}>
        <g clip-path="url(#clip0_1585_13462)">
        <path d="M0.699012 13.7725C1.00782 14.0725 1.51956 14.0725 1.81954 13.7725L7.46632 8.12566L13.1131 13.7725C13.4131 14.0725 13.9336 14.0812 14.2336 13.7725C14.5336 13.4636 14.5336 12.9607 14.2336 12.6607L8.58685 7.00513L14.2336 1.35835C14.5336 1.05837 14.5425 0.54663 14.2336 0.246645C13.9249 -0.062163 13.4131 -0.062163 13.1131 0.246645L7.46632 5.89342L1.81954 0.246645C1.51956 -0.062163 0.998997 -0.070986 0.699012 0.246645C0.399028 0.555453 0.399028 1.05837 0.699012 1.35835L6.34579 7.00513L0.699012 12.6607C0.399028 12.9607 0.390205 13.4724 0.699012 13.7725Z"/>
        </g>
        <defs>
        <clipPath id="clip0_1585_13462">
        <rect width="13.9912" height="14" transform="translate(0.470703)"/>
        </clipPath>
        </defs>
        </svg>
    )
}