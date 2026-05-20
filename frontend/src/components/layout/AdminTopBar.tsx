import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Definimos la estructura de datos que guardamos del Administrador en Postgres
interface AdminSesion {
  nombres: string;
  ap_pat: string;
  correo: string;
  tipo_usuario: string;
}

export const AdminTopBar: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminSesion | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Jalamos la sesión específica del administrador
    const sesion = localStorage.getItem('vetcare_sesion_admin');
    
    if (sesion) {
      setAdmin(JSON.parse(sesion));
    }
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem('vetcare_sesion_admin');
    navigate('/login');
  };

  return (
    <header className="h-20 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm flex-shrink-0">
      
      {/* Buscador */}
      <div className="relative w-96 group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
        <input 
          type="text" 
          placeholder="Buscar pacientes, dueños o citas..." 
          className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-2.5 rounded-full focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline/70"
        />
      </div>

      {/* Sección de Notificaciones y Usuario */}
      <div className="flex items-center gap-6">
        
        {/* Botón Notificaciones */}
        <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary-container rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-outline-variant/50"></div>
        
        {/* Menú de Perfil Dinámico */}
        <div className="relative">
          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 cursor-pointer hover:bg-surface-container px-3 py-1.5 rounded-xl transition-colors select-none"
          >
            <div className="text-right hidden md:block">
              {/* ◄ Aquí mostramos el nombre real del Administrador de Postgres */}
              <p className="font-body text-sm font-bold text-on-surface">
                {admin ? `${admin.nombres} ${admin.ap_pat}` : 'Cargando...'}
              </p>
              {/* ◄ Rol secundario dinámico o estático según prefieras */}
              <p className="font-body text-xs text-on-surface-variant">
                {admin ? admin.tipo_usuario : 'Personal'}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant transition-transform" style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              expand_more
            </span>
          </div>

          {/* Submenú desplegable de opciones (Cerrar Sesión) */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant/30 rounded-xl shadow-ambient overflow-hidden z-40 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2.5 border-b border-outline-variant/20 bg-surface-container-low">
                <p className="font-body text-xs text-on-surface-variant truncate">{admin?.correo}</p>
              </div>
              <button 
                onClick={handleCerrarSesion}
                className="w-full text-left font-body text-sm text-error hover:bg-error-container/10 px-4 py-3 flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};