import React from "react";

interface InputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string; // Add className as an optional prop
}

const Input: React.FC<InputProps> = ({ label, type, name, value, onChange, placeholder, className }) => {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${className}`}
      />
    </div>
  );
};

export default Input;