import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const SideNavBar: React.FC = () => {
  const location = useLocation();

  // Comprueba si la ruta actual coincide con el enlace para marcarlo como activo
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-64 flex-shrink-0 h-screen flex flex-col py-6 bg-surface-container-low border-r border-outline-variant/50 shadow-sm relative z-40">
      
      {/* Cabecera del Menú */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined icon-fill">pets</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-primary tracking-tight leading-tight">VetCare Admin</h1>
            <p className="font-body text-xs font-semibold text-on-surface-variant">Paws & Palms</p>
          </div>
        </div>
        
        <button className="w-full bg-secondary-container text-white font-body text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-ambient">
          <span className="material-symbols-outlined icon-fill">add</span>
          Nueva Cita
        </button>
      </div>

      {/* Enlaces de Navegación Interconectados */}
      <div className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          <li>
            <Link 
              to="/admin/dashboard" 
              className={`rounded-xl font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 transition-all duration-200 ${
                isActive('/admin/dashboard') 
                  ? 'bg-primary-container text-white shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined mr-3 ${isActive('/admin/dashboard') ? 'icon-fill' : ''}`}>calendar_today</span>
              Panel General
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/staff" 
              className={`rounded-xl font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 transition-all duration-200 ${
                isActive('/admin/staff') 
                  ? 'bg-primary-container text-white shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined mr-3 ${isActive('/admin/staff') ? 'icon-fill' : ''}`}>badge</span>
              Personal
            </Link>
          </li>
          <li>
            <a href="#" className="text-on-surface-variant font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 rounded-xl hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary transition-all duration-200">
              <span className="material-symbols-outlined mr-3">group</span>
              Clientes y Mascotas
            </a>
          </li>
        </ul>
      </div>

      {/* Opciones Inferiores de Cierre de Sesión */}
      <div className="mt-auto pt-4 border-t border-outline-variant/50 px-4">
        <ul className="space-y-1">
          <li>
            <Link to="/login" className="text-error font-body text-sm font-semibold flex items-center px-4 py-3 rounded-xl hover:bg-error-container/50 hover:translate-x-1 transition-all duration-200">
              <span className="material-symbols-outlined mr-3">logout</span>
              Cerrar Sesión
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};