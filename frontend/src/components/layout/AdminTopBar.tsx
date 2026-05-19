import React from 'react';

export const AdminTopBar: React.FC = () => {
  return (
    <header className="h-20 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm flex-shrink-0">
      <div className="relative w-96 group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
        <input 
          type="text" 
          placeholder="Buscar pacientes, dueños o citas..." 
          className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-2.5 rounded-full focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline/70"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary-container rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-outline-variant/50"></div>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-container px-3 py-1.5 rounded-xl transition-colors">
          <div className="text-right hidden md:block">
            <p className="font-body text-sm font-bold text-on-surface">Dr. Sarah Jenkins</p>
            <p className="font-body text-xs text-on-surface-variant">Admin Principal</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
        </div>
      </div>
    </header>
  );
};