import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'action';
  fullWidth?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  icon,
  className = '',
  ...props
}) => {
  // Estilos base de animación física "squishy" indicados en las directivas de diseño
  const baseStyles = "font-body text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-ambient";
  
  const variants = {
    // Botón principal naranja tipo píldora (Ej: "Reservar Cita")
    primary: "bg-secondary-container text-white px-8 py-3.5 rounded-full hover:bg-secondary",
    
    // Botón más compacto para barras de navegación (Ej: "Login")
    secondary: "bg-secondary-container text-white px-6 py-2.5 rounded-full hover:bg-secondary",
    
    // Botón transparente con borde sutil (Ej: "Nuestros Servicios")
    outline: "bg-surface text-primary border border-outline-variant px-8 py-3.5 rounded-full hover:bg-surface-variant/50",
    
    // Botón rectangular con bordes definidos para formularios (Ej: "INGRESAR")
    action: "border-2 border-secondary bg-secondary-container text-white py-3.5 px-4 rounded-xl font-display text-lg font-bold tracking-wider uppercase shadow-md hover:bg-secondary hover:-translate-y-0.5 active:translate-y-0"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
    </button>
  );
};