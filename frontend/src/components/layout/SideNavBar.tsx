import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SideNavBarProps {
  onOpenGlobalAppointment: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({ onOpenGlobalAppointment }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-64 flex-shrink-0 h-screen flex flex-col py-6 bg-surface-container-low border-r border-outline-variant/50 shadow-sm relative z-40">
      
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
        
        {/* Botón convertido en Link hacia la pantalla de Citas */}
        <button 
          onClick={onOpenGlobalAppointment} 
          className="w-full bg-secondary-container text-white font-body text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-ambient"
        >
          <span className="material-symbols-outlined icon-fill">add</span>
          Nueva Cita
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          <li>
            <Link to="/admin/dashboard" className={`rounded-xl font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 transition-all duration-200 ${isActive('/admin/dashboard') ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary'}`}>
              <span className={`material-symbols-outlined mr-3 ${isActive('/admin/dashboard') ? 'icon-fill' : ''}`}>calendar_today</span>
              Panel General
            </Link>
          </li>
          <li>
            {/* Pestaña dedicada para Citas */}
            <Link to="/admin/appointments" className={`rounded-xl font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 transition-all duration-200 ${isActive('/admin/appointments') ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary'}`}>
              <span className={`material-symbols-outlined mr-3 ${isActive('/admin/appointments') ? 'icon-fill' : ''}`}>book_online</span>
              Citas y Agenda
            </Link>
          </li>
          <li>
            <Link to="/admin/staff" className={`rounded-xl font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 transition-all duration-200 ${isActive('/admin/staff') ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary'}`}>
              <span className={`material-symbols-outlined mr-3 ${isActive('/admin/staff') ? 'icon-fill' : ''}`}>badge</span>
              Personal
            </Link>
          </li>
          <li>
            <Link to="/admin/clients" className={`rounded-xl font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 transition-all duration-200 ${isActive('/admin/clients') ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary'}`}>
              <span className={`material-symbols-outlined mr-3 ${isActive('/admin/clients') ? 'icon-fill' : ''}`}>group</span>
              Clientes y Mascotas
            </Link>
          </li>
          <li>
            <Link to="/admin/inventory" className={`rounded-xl font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 transition-all duration-200 ${isActive('/admin/inventory') ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary'}`}>
              <span className={`material-symbols-outlined mr-3 ${isActive('/admin/inventory') ? 'icon-fill' : ''}`}>inventory_2</span>
              Inventario
            </Link>
          </li>
          
          {/* NUEVO BOTÓN DE REPORTES (No funcional aún, solo visual) */}
          <li className="mt-4 pt-4 border-t border-outline-variant/30">
            <a href="#" className="text-on-surface-variant font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 rounded-xl hover:bg-surface-variant/50 hover:translate-x-1 hover:text-tertiary transition-all duration-200">
              <span className="material-symbols-outlined mr-3">analytics</span>
              Reportes y Analíticas
            </a>
          </li>
        </ul>
      </div>

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