import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  fullWidth?: boolean;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: IconDefinition;
  iconPosition?: "left" | "right";
  loading?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  text,
  fullWidth = false,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  className = "",
  onClick,
  ...props
}) => {
  // Button variants
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
    info: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900",
  };

  // Button sizes
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-xl",
  };

  // Loading animation
  const loadingAnimation = (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <button
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? "w-full" : "w-auto"} 
        font-medium transition-all duration-300 transform active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        flex items-center justify-center
        ${className}
      `}
      onClick={onClick}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          {loadingAnimation}
          <span>{text}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <FontAwesomeIcon icon={icon} className={text ? "mr-2" : ""} />
          )}
          <span>{text}</span>
          {icon && iconPosition === "right" && (
            <FontAwesomeIcon icon={icon} className={text ? "ml-2" : ""} />
          )}
        </>
      )}
    </button>
  );
};

export default Button;
