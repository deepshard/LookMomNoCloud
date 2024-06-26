import { Button as AntdButton, ButtonProps as AntdButtonProps } from "antd";
import { useEffect, useRef } from "react";

const Button = ({ children, className = "", ...props }: AntdButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <AntdButton className={`truffle-btn ${className}`} {...props}>
      {children}
    </AntdButton>
  );
};

export default Button;
