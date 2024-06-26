export default ({ height, width, onClick, className="" }: { height: number, width: number, onClick?: () => void, className?: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick} className={`...? ${className}`}>
        <g clip-path="url(#clip0_1585_13458)">
        <path d="M9.18458 13.9924C9.55842 13.9924 9.8636 13.8398 10.2298 13.4965L16.2494 7.81256C16.5394 7.53791 16.6386 7.24798 16.6386 6.9962C16.6386 6.73681 16.5469 6.45452 16.2494 6.17223L10.2298 0.541692C9.82546 0.160219 9.57368 0 9.19984 0C8.66578 0 8.28431 0.419621 8.28431 0.930793V3.81473H8.06305C2.57747 3.81473 0.189453 7.33191 0.189453 12.9701C0.189453 13.6262 0.563296 13.9924 0.975287 13.9924C1.29572 13.9924 1.64667 13.9162 1.91371 13.4278C3.24124 10.933 5.11045 10.1853 8.06305 10.1853H8.28431V13.0998C8.28431 13.6109 8.66578 13.9924 9.18458 13.9924Z" />
        </g>
        <defs>
        <clipPath id="clip0_1585_13458">
        <rect width="16.4491" height="14"  transform="translate(0.189453)"/>
        </clipPath>
        </defs>
        </svg>
    )
}