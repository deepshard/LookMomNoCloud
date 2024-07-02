import { Tooltip as AntdTooltip, TooltipProps as AntdTooltipProps } from "antd";
import { TooltipRef } from "antd/es/tooltip";
import { forwardRef } from "react";

const Tooltip = forwardRef<TooltipRef, AntdTooltipProps>(({ children, className, arrow = false, placement='bottom', overlayClassName = "", ...props }, ref) => {
  return (
    <AntdTooltip
      ref={ref}
      overlayClassName={` ${overlayClassName}`}
      overlayInnerStyle={{
        padding: "10px",
        fontSize: "12px",
        width: "fit-content",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: "5px",
        borderColor: "rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(20px)",
        ...props.overlayInnerStyle,
      }}
      placement={placement}
      arrow={arrow}
      {...props}>
      {children}
    </AntdTooltip>
  );
});

export default Tooltip;
