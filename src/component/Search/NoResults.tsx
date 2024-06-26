
// @ts-ignore
import warningIcon from '../../assets/icons/warning.svg'

const NoResults = ({className='', ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`text-surface-400 bg-surface-500 rounded-sm flex-center gap-2 ${className}`} {...props}>
        <img src={warningIcon} alt="no results" />
        <p>No results available</p>
    </div>
  )
}

export default NoResults