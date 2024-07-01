import {SwitchProps, Switch as AntdSwitch} from 'antd'
import './Switch.css'

const Switch = ({...props}: SwitchProps) => {
  return (
    <AntdSwitch {...props} className={`${(props.value || props.checked) ? 'switch-enabled' : ''} ${props.className}`} />
  )
}

export default Switch