import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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
      // Va directo al historial clínico
      navigate(`/admin/clinical-history/${item.idMascota}`);
    } else if (item.type === 'client') {
      // ENFOQUE CORREGIDO: Viaja a la pantalla de clientes enviando el nombre como un estado
      navigate(`/admin/clients`, { state: { searchName: item.title } });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(value.length > 0); 
  };

  return (
    <header className="h-20 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm flex-shrink-0">
      
      {/* ================= BUSCADOR GLOBAL (CORREGIDO) ================= */}
      {/* flex-1: Crece para ocupar espacio. 
          min-w-[300px]: Evita que se colapse totalmente como en tu captura.
          max-w-xl: Le damos un ancho máximo un poco mayor para mejor usabilidad. */}
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

        {/* MENÚ DESPLEGABLE DE RESULTADOS (CORREGIDO) */}
        {/* w-full asegura que use todo el ancho de su contenedor padre */}
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

      {/* ================= PERFIL DE USUARIO (CORREGIDO) ================= */}
      {/* shrink-0: Evita que estos elementos se encojan y aplasten el buscador */}
      <div className="flex items-center gap-6 shrink-0">
        <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary-container rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-outline-variant/50"></div>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-container px-3 py-1.5 rounded-xl transition-colors">
          <div className="text-right hidden md:block">
            <p className="font-body text-sm font-bold text-on-surface">Joel Fernando</p>
            <p className="font-body text-xs text-on-surface-variant">Admin Principal</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
        </div>
      </div>
    </header>
  );
};