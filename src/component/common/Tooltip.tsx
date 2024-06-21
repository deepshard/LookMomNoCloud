import { Tooltip as AntdTooltip, TooltipProps as AntdTooltipProps } from 'antd';
import { TooltipRef } from 'antd/es/tooltip';
import { forwardRef } from 'react';

const Tooltip = forwardRef<TooltipRef, AntdTooltipProps>(({ children, className, ...props }, ref) => {
  return (
    <AntdTooltip ref={ref} {...props} className={className}>
      {children}
    </AntdTooltip>
  );
});

export default Tooltip;
