export default ({ height, width, onClick, className="" }: { height: number, width: number, onClick?: () => void, className?: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick} className={`...? ${className}`}>
        <g clip-path="url(#clip0_1581_13355)">
        <path d="M14.0625 10.4701L14.0529 0.947481C14.0529 0.407929 13.7023 0.0292969 13.1336 0.0292969H3.59803C3.06723 0.0292969 2.70705 0.436327 2.70705 0.890685C2.70705 1.34504 3.11462 1.73315 3.56012 1.73315H6.8587L11.4843 1.58169L9.72125 3.12462L0.327902 12.5242C0.157287 12.6945 0.0625 12.9123 0.0625 13.1205C0.0625 13.5749 0.470082 14.0009 0.944015 14.0009C1.16202 14.0009 1.37055 13.9252 1.54118 13.7453L10.9535 4.35517L12.5174 2.58506L12.3468 7.00559V10.5079C12.3468 10.9528 12.7355 11.3693 13.1999 11.3693C13.6549 11.3693 14.0625 10.9812 14.0625 10.4701Z"/>
        </g>
        <defs>
        <clipPath id="clip0_1581_13355">
        <rect width="14" height="14" transform="translate(0.0625)"/>
        </clipPath>
        </defs>
        </svg>
    )
}