import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-blue-300",
    outline: "border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm",
    ghost: "text-blue-600 hover:bg-blue-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
