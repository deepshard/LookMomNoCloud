export default ({ height, width, onClick, className="" }: { height: number, width: number, onClick?: () => void, className?: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick} className={`...? ${className}`}>
        <g clip-path="url(#clip0_1585_13466)">
        <path d="M0.991151 13.9991C1.32154 13.9991 1.60236 13.8669 1.93275 13.677L11.5634 8.11003C12.249 7.70531 12.4885 7.441 12.4885 7.00325C12.4885 6.56548 12.249 6.30118 11.5634 5.90472L1.93275 0.32949C1.60236 0.139519 1.32154 0.015625 0.991151 0.015625C0.379941 0.015625 0 0.478162 0 1.19675V12.8097C0 13.5284 0.379941 13.9991 0.991151 13.9991Z" />
        </g>
        <defs>
        <clipPath id="clip0_1585_13466">
        <rect width="12.4885" height="14" />
        </clipPath>
        </defs>
        </svg>
    )
}