import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const SideNavBarCliente: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  const linkClass = (path: string) =>
    `rounded-xl font-body text-sm font-semibold flex items-center px-4 py-3 mx-2 transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-container text-white shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-primary'
    }`;

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="w-64 flex-shrink-0 min-h-screen flex flex-col py-6 bg-surface-container-low border-r border-outline-variant/50 shadow-sm relative z-40">

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
              Panel del Cliente
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
              to="/cliente/dashboard"
              className={linkClass('/cliente/dashboard')}
            >
              <span className={`material-symbols-outlined mr-3 ${
                isActive('/cliente/dashboard') ? 'icon-fill' : ''
              }`}>
                dashboard
              </span>
              Panel General
            </Link>
          </li>

          {/* MIS MASCOTAS */}
          <li>
            <Link
              to="/cliente/mascotas"
              className={linkClass('/cliente/mascotas')}
            >
              <span className={`material-symbols-outlined mr-3 ${
                isActive('/cliente/mascotas') ? 'icon-fill' : ''
              }`}>
                pets
              </span>
              Mis Mascotas
            </Link>
          </li>

          {/* CATÁLOGO */}
          <li>
            <Link
              to="/cliente/catalogo"
              className={linkClass('/cliente/catalogo')}
            >
              <span className={`material-symbols-outlined mr-3 ${
                isActive('/cliente/catalogo') ? 'icon-fill' : ''
              }`}>
                storefront
              </span>
              Catálogo
            </Link>
          </li>

          {/* MIS CITAS */}
          <li>
            <Link
              to="/cliente/citas"
              className={linkClass('/cliente/citas')}
            >
              <span className={`material-symbols-outlined mr-3 ${
                isActive('/cliente/citas') ? 'icon-fill' : ''
              }`}>
                calendar_month
              </span>
              Mis Citas
            </Link>
          </li>

        </ul>
      </div>

      {/* CERRAR SESIÓN */}
      <div className="mt-auto pt-4 border-t border-outline-variant/50 px-4">
        <button
          type="button"
          onClick={handleCerrarSesion}
          className="w-full text-error font-body text-sm font-semibold flex items-center px-4 py-3 rounded-xl hover:bg-error-container/50 hover:translate-x-1 transition-all duration-200"
        >
          <span className="material-symbols-outlined mr-3">
            logout
          </span>
          Cerrar Sesión
        </button>
      </div>

    </nav>
  );
};