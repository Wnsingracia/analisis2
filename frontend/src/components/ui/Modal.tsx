import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-[800px]' // Valor arbitrario seguro por defecto
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-on-surface/40 backdrop-blur-sm transition-opacity">
      
      {/* Contenedor del Modal: Se agregó min-w para evitar el colapso absoluto */}
      <div className={`bg-white rounded-[1.5rem] shadow-ambient w-full ${maxWidth} min-w-[320px] sm:min-w-[400px] max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200`}>
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest shrink-0">
          <h3 className="font-display text-xl font-bold text-primary tracking-tight truncate pr-4">{title}</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        {/* Cuerpo Scrolleable */}
        <div className="p-6 overflow-y-auto bg-surface-container-lowest flex-1">
          {children}
        </div>
        
      </div>
    </div>
  );
};