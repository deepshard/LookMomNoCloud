export default ({ height, width, onClick, className="" }: { height: number, width: number, onClick?: () => void, className?: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick} className={`...? ${className}`}>
        <g clip-path="url(#clip0_1582_13394)">
        <path d="M1.36999 13.9996H11.6234C12.4415 13.9996 12.9309 13.6173 12.9309 12.9827C12.9309 11.01 10.4612 8.288 6.49286 8.288C2.53219 8.288 0.0625 11.01 0.0625 12.9827C0.0625 13.6173 0.55185 13.9996 1.36999 13.9996ZM6.50051 6.91935C8.13678 6.91935 9.55895 5.45129 9.55895 3.53978C9.55895 1.65119 8.13678 0.251953 6.50051 0.251953C4.86425 0.251953 3.44207 1.68178 3.44207 3.55507C3.44207 5.45129 4.8566 6.91935 6.50051 6.91935Z" />
        </g>
        <defs>
        <clipPath id="clip0_1582_13394">
        <rect width="12.8684" height="14"  transform="translate(0.0625)"/>
        </clipPath>
        </defs>
        </svg>
    )
}