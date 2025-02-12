import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, fullWidth = false, className, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        fullWidth ? "w-full" : "w-auto"
      } ${className}`}
      {...props}
    >
      {text}
    </button>
  );
};

export default Button;