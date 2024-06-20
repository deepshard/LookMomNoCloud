import { Tooltip as AntdTooltip, TooltipProps as AntdTooltipProps } from 'antd';
import { forwardRef } from 'react';

const Tooltip = forwardRef<HTMLElement, AntdTooltipProps>(({ children, className, ...props }) => {
  return (
    <AntdTooltip {...props} className={className}>
      {children}
    </AntdTooltip>
  );
});

export default Tooltip;
