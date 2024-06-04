import React from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

function SysInfoProgressBar() {
  return (
    <CircularProgressbar 
        // value={usedPercentage}
        value={75}
        // text={isHovered ? `${usedPercentage.toFixed(0)}%` : ' '}
        text='75%'
        strokeWidth={14}
        styles={buildStyles({
        textColor: 'rgba(255, 255, 255, 0.75)',
        pathColor: 'rgba(255, 255, 255, 1)',
        trailColor: 'rgba(255, 255, 255, 0.1)',
        textSize: '12px',
        pathTransitionDuration: 0.5,
        })}
    />
  )
}

export default SysInfoProgressBar