import React, { useState } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: string;
  isPassword?: boolean; // Nueva propiedad opcional
}

export const InputField: React.FC<InputFieldProps> = ({ label, icon, id, isPassword = false, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Si es contraseña, alternamos entre text y password. Si no, usamos el tipo normal.
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-on-surface font-bold text-[15px] font-body" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-outline/80 text-[22px]">{icon}</span>
        </div>
        
        <input
          id={id}
          className="w-full pl-11 pr-12 py-3.5 border border-outline-variant rounded-lg font-body text-sm text-on-surface bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/60 shadow-sm"
          {...props}
          type={inputType}
        />
        
        {isPassword && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-container focus:outline-none p-1.5 rounded-full hover:bg-surface transition-colors"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined text-[22px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};