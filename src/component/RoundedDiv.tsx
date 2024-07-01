import React, { useRef, useEffect, useState } from 'react'
import { getSvgPath } from 'figma-squircle'

interface RoundedDiv extends React.HTMLAttributes<HTMLDivElement> {
  cornerRadius: number
  className?: string
}

const RoundedDiv: React.FC<RoundedDiv> = ({
  cornerRadius,
  className = '',
  children,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [path, setPath] = useState<string>('')

  useEffect(() => {
    if (divRef.current) {
      const { width, height } = divRef.current.getBoundingClientRect()
      const smoothPath = getSvgPath({
        width,
        height,
        cornerRadius,
        cornerSmoothing: 0.5,
      })
      setPath(smoothPath)
    }
  }, [cornerRadius])

  return (
    <div
      ref={divRef}
      className={`relative ${className}`}
      style={{
        clipPath: path ? `path('${path}')` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export default RoundedDiv;
