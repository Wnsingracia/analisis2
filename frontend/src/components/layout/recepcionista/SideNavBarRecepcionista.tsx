import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const SideNavBarRecepcionista: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path;

  const linkClass = (path: string) =>
    `rounded-xl font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-container text-white shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary'
    }`;

  return (
    <nav className="w-64 flex-shrink-0 h-screen flex flex-col py-6 bg-surface-container-low border-r border-outline-variant/50 shadow-sm relative z-40">

      {/* ENCABEZADO */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined icon-fill">
              pets
            </span>
          </div>

          <div>
            <h1 className="font-display text-lg font-bold text-primary tracking-tight leading-tight">
              VetCare
            </h1>
            <p className="font-body text-xs font-semibold text-on-surface-variant">
              Panel de Recepción
            </p>
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <div className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">

          {/* PANEL GENERAL */}
          <li>
            <Link
              to="/recepcionista/dashboard"
              className={linkClass('/recepcionista/dashboard')}
            >
              <span className={`material-symbols-outlined mr-3 ${
                isActive('/recepcionista/dashboard') ? 'icon-fill' : ''
              }`}>
                dashboard
              </span>
              Panel General
            </Link>
          </li>

          {/* CITAS Y AGENDA */}
          <li>
            <Link
              to="/recepcionista/appointments"
              className={linkClass('/recepcionista/appointments')}
            >
              <span className={`material-symbols-outlined mr-3 ${
                isActive('/recepcionista/appointments') ? 'icon-fill' : ''
              }`}>
                book_online
              </span>
              Citas y Agenda
            </Link>
          </li>

          {/* INVENTARIO */}
          <li>
            <Link
              to="/recepcionista/inventory"
              className={linkClass('/recepcionista/inventory')}
            >
              <span className={`material-symbols-outlined mr-3 ${
                isActive('/recepcionista/inventory') ? 'icon-fill' : ''
              }`}>
                inventory_2
              </span>
              Inventario
            </Link>
          </li>

        </ul>
      </div>

      {/* CERRAR SESIÓN */}
      <div className="mt-auto pt-4 border-t border-outline-variant/50 px-4">
        <ul className="space-y-1">
          <li>
            <Link
              to="/login"
              className="text-error font-body text-sm font-semibold flex items-center px-4 py-3 rounded-xl hover:bg-error-container/50 hover:translate-x-1 transition-all duration-200"
            >
              <span className="material-symbols-outlined mr-3">
                logout
              </span>
              Cerrar Sesión
            </Link>
          </li>
        </ul>
      </div>

    </nav>
  );
};
