
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoVetCare2 from '../../assets/logo-VetCare2.jpeg';

export const AdminTopBar: React.FC = () => {
  const { usuario: admin, cerrarSesion } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Cerrar sesión
  const handleCerrarSesion = async () => {
    if (cerrandoSesion) return;

    try {
      setCerrandoSesion(true);
      await cerrarSesion();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setCerrandoSesion(false);
      alert('No se pudo cerrar la sesión. Inténtalo nuevamente.');
    }
  };

  // Obtener iniciales del administrador
  const iniciales = admin
    ? `${admin.nombres?.charAt(0) || ''}${admin.ap_pat?.charAt(0) || ''}`.toUpperCase()
    : 'AD';

  return (
    <header className="h-20 bg-white border-b border-outline-variant/30 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-sm flex-shrink-0">

      {/* ================= IDENTIDAD VETCARE ================= */}
      <div className="flex items-center gap-3 min-w-0">

        <div className="w-12 h-12 rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm shrink-0">
          <img
            src={logoVetCare2}
            alt="Logo VetCare"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0">
          <h1 className="font-display text-lg sm:text-xl font-bold text-primary tracking-wide">
            VetCare
          </h1>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>

            <p className="font-body text-[10px] sm:text-xs font-bold text-on-surface-variant tracking-widest uppercase truncate">
              Panel de Administración
            </p>
          </div>
        </div>

      </div>

      {/* ================= PERFIL ADMINISTRADOR ================= */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">

        {/* Separador */}
        <div className="hidden sm:block h-9 w-px bg-outline-variant/50"></div>

        <div className="relative" ref={profileMenuRef}>

          {/* Botón de perfil */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl hover:bg-surface-container-low transition-all select-none"
          >

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {iniciales}
            </div>

            {/* Datos del administrador */}
            <div className="text-left hidden sm:block max-w-[180px]">
              <p className="font-body text-sm font-bold text-on-surface truncate">
                {admin
                  ? `${admin.nombres} ${admin.ap_pat}`
                  : 'Cargando...'}
              </p>

              <p className="font-body text-xs text-on-surface-variant">
                {admin?.tipo_usuario || 'Personal'}
              </p>
            </div>

            {/* Flecha */}
            <span
              className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
              style={{
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              expand_more
            </span>

          </button>

          {/* ================= MENÚ DESPLEGABLE ================= */}
          {menuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">

              {/* Cabecera del menú */}
              <div className="px-5 py-4 bg-surface-container-low border-b border-outline-variant/20">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {iniciales}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">
                      {admin
                        ? `${admin.nombres} ${admin.ap_pat}`
                        : 'Administrador'}
                    </p>

                    <p className="text-xs text-on-surface-variant">
                      {admin?.tipo_usuario || 'Personal'}
                    </p>
                  </div>

                </div>

              </div>

              {/* Información */}
              <div className="p-2">

                <div className="px-3 py-3 flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-xl">
                    admin_panel_settings
                  </span>

                  <span className="text-sm font-medium">
                    Cuenta administrativa
                  </span>
                </div>

                <div className="h-px bg-outline-variant/30 mx-2"></div>

                {/* Cerrar sesión */}
                <button
                  type="button"
                  onClick={handleCerrarSesion}
                  disabled={cerrandoSesion}
                  className="w-full text-left px-3 py-3 flex items-center gap-3 rounded-xl text-error hover:bg-error-container/10 transition-colors font-bold text-sm disabled:opacity-50"
                >

                  <span className="material-symbols-outlined text-xl">
                    {cerrandoSesion ? 'progress_activity' : 'logout'}
                  </span>

                  {cerrandoSesion
                    ? 'Cerrando sesión...'
                    : 'Cerrar Sesión'}

                </button>

              </div>

              {/* Pie del menú */}
              <div className="px-5 py-3 bg-surface-container-low border-t border-outline-variant/20">
                <p className="text-[10px] text-center text-on-surface-variant tracking-wider">
                  VETCARE © 2026
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
};
