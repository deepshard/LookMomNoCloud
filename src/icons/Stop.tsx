export default ({ height, width, onClick, className="" }: { height: number, width: number, onClick?: () => void, className?: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick} className={`...? ${className}`}>
        <g clip-path="url(#clip0_1585_13470)">
        <path d="M0.488281 12.0944C0.488281 13.2875 1.20931 13.9915 2.41103 13.9915H12.5484C13.7587 13.9915 14.4711 13.2875 14.4711 12.0944V1.897C14.4711 0.703864 13.7587 0 12.5484 0H2.41103C1.20931 0 0.488281 0.703864 0.488281 1.897V12.0944Z" />
        </g>
        <defs>
        <clipPath id="clip0_1585_13470">
        <rect width="13.9828" height="14"  transform="translate(0.488281)"/>
        </clipPath>
        </defs>
        </svg>
    )
}