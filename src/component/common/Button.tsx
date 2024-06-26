import { Button as AntdButton, ButtonProps as AntdButtonProps } from "antd";

const Button = ({ children, className = "", ...props }: AntdButtonProps) => {
  return (
    <AntdButton className={`truffle-btn ${className}`} {...props}>
      {children}
    </AntdButton>
  );
};

export default Button;
