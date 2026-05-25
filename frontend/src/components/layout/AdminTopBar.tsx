import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Structure of the Admin session stored in localStorage
interface AdminSesion {
  nombres: string;
  ap_pat: string;
  correo: string;
  tipo_usuario: string;
}

// ================= MOCK DATA (Simulando la base de datos global) =================
const globalSearchData = [
  { type: 'client', idUsuario: '201', title: 'Carlos Mendoza', subtitle: 'carlos.m@mail.com', extra: '71234567' },
  { type: 'client', idUsuario: '202', title: 'Lucía Fernández', subtitle: 'lucia.f@mail.com', extra: '79876543' },
  { type: 'pet', idMascota: 'm1', idCliente: '201', title: 'Rex', subtitle: 'Perro • Pastor Aleman', extra: 'Dueño: Carlos M.' },
  { type: 'pet', idMascota: 'm2', idCliente: '202', title: 'Luna', subtitle: 'Gato • Siamés', extra: 'Dueño: Lucía F.' },
];

export const AdminTopBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminSesion | null>(null); // ◄ Estado para el administrador dinámico
  const [menuOpen, setMenuOpen] = useState(false); // ◄ Estado para el dropdown del perfil
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null); // ◄ Ref para cerrar el menú de perfil al hacer clic fuera
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Cargar datos del administrador logueado
    const sesion = localStorage.getItem('vetcare_sesion_admin');
    if (sesion) {
      setAdmin(JSON.parse(sesion));
    }

    // 2. Manejador de clics externos para cerrar menús desplegables
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = globalSearchData.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResultClick = (item: any) => {
    setIsDropdownOpen(false);
    setSearchTerm(''); 
    
    if (item.type === 'pet') {
      navigate(`/admin/clinical-history/${item.idMascota}`);
    } else if (item.type === 'client') {
      navigate(`/admin/clients`, { state: { searchName: item.title } });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(value.length > 0); 
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('vetcare_sesion_admin');
    navigate('/login');
  };

  return (
    <header className="h-20 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm flex-shrink-0">
      
      {/* ================= BUSCADOR GLOBAL ================= */}
      <div className="relative flex-1 min-w-[300px] max-w-xl group mr-6" ref={dropdownRef}>
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[22px]">search</span>
        <input 
          type="text" 
          placeholder="Buscar pacientes, dueños o citas..." 
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => { if (searchTerm.length > 0) setIsDropdownOpen(true); }}
          className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-2.5 rounded-full focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline/70"
        />

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-outline-variant/30 overflow-hidden z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 w-full min-w-[300px]">
            {searchResults.length > 0 ? (
              <ul className="divide-y divide-outline-variant/20 w-full">
                {searchResults.map((item, index) => (
                  <li key={index} className="w-full">
                    <button 
                      onClick={() => handleResultClick(item)}
                      className="w-full text-left px-5 py-3 hover:bg-surface-container-low transition-colors flex items-center gap-4"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'pet' ? 'bg-primary-container/30 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {item.type === 'pet' ? 'cruelty_free' : 'person'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-bold text-on-surface truncate">{item.title}</p>
                        <p className="font-body text-xs text-on-surface-variant truncate">{item.subtitle}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="font-body text-[10px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container px-2 py-1 rounded-md">
                          {item.type === 'pet' ? 'Paciente' : 'Cliente'}
                        </span>
                        <p className="font-body text-[10px] text-on-surface-variant mt-1">{item.extra}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-on-surface-variant w-full min-w-[300px]">
                <span className="material-symbols-outlined text-3xl mb-2 opacity-50">search_off</span>
                <p className="font-body text-sm">No se encontraron resultados para "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= PERFIL DE USUARIO DINÁMICO ================= */}
      <div className="flex items-center gap-6 shrink-0">
        <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary-container rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-outline-variant/50"></div>
        
        {/* Contenedor interactivo del perfil */}
        <div className="relative" ref={profileMenuRef}>
          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 cursor-pointer hover:bg-surface-container px-3 py-1.5 rounded-xl transition-colors select-none"
          >
            <div className="text-right hidden md:block">
              {/* ◄ Renderizado dinámico del Administrador con datos de Postgres */}
              <p className="font-body text-sm font-bold text-on-surface">
                {admin ? `${admin.nombres} ${admin.ap_pat}` : 'Cargando...'}
              </p>
              <p className="font-body text-xs text-on-surface-variant">
                {admin ? admin.tipo_usuario : 'Personal'}
              </p>
            </div>
            <span 
              className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
              style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </div>

          {/* MENÚ DESPLEGABLE DE PERFIL / ACCIONES */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-outline-variant/30 rounded-xl shadow-ambient overflow-hidden z-40 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2.5 border-b border-outline-variant/20 bg-surface-container-low">
                <p className="font-body text-xs font-semibold text-on-surface-variant truncate">{admin?.correo}</p>
              </div>
              <button 
                onClick={handleCerrarSesion}
                className="w-full text-left font-body text-sm text-error hover:bg-error-container/10 px-4 py-3 flex items-center gap-2 transition-colors font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};