import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

interface Paciente {
  id_mascota: number;
  nombre: string;
  tipo: string;
  raza: string;
  edad: string;
  genero: string;
  dueno_nombre: string;
  ultima_consulta: string;
}

export default function MisPacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPacientes = async () => {
      const sesion = localStorage.getItem('vetcare_sesion_vet');
      if (!sesion) return navigate('/login');
      
      const datos = JSON.parse(sesion);
      // 🛠️ SOLUCIÓN: Validamos ambas propiedades para evitar el 'undefined'
      const idVeterinario = datos.id_usuario || datos.id; 

      if (!idVeterinario) {
        console.error("No se encontró id_usuario ni id en el objeto de sesión:", datos);
        alert("Error de autenticación: No se pudo identificar tu ID de personal. Por favor, reincia sesión.");
        navigate('/login');
        return;
      }
      
      try {
        const res = await api.get(`/usuarios/mis-pacientes/${idVeterinario}`);
        setPacientes(res.data);
      } catch (error: any) {
        console.error("Error al cargar pacientes:", error);
        alert("Error al cargar tus pacientes atendidos.");
      } finally {
        setCargando(false);
      }
    };
    cargarPacientes();
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-[#f8fbfa] p-6 font-body">
      <div className="max-w-[1000px] mx-auto bg-white rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8">
        
        <header className="mb-6 flex items-center justify-between border-b border-outline-variant/20 pb-4">
          <div>
            <Link to="/vet/dashboard" className="text-xs font-bold text-on-surface-variant hover:text-primary flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span> Volver al Dashboard
            </Link>
            <h1 className="font-display text-2xl font-bold text-primary">Mis Pacientes Atendidos</h1>
            <p className="text-sm text-on-surface-variant">Listado de mascotas que han pasado por tus consultas médicas.</p>
          </div>
        </header>

        {cargando ? (
          <p className="text-center py-8 text-sm text-on-surface-variant animate-pulse">Buscando historiales en Postgres...</p>
        ) : pacientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase">
                  <th className="p-4">Paciente</th>
                  <th className="p-4">Especie / Raza</th>
                  <th className="p-4">Dueño Responsable</th>
                  <th className="p-4">Última Visita</th>
                  <th className="p-4 text-center">Historial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {pacientes.map((pac) => (
                  <tr key={pac.id_mascota} className="hover:bg-surface-container/30 transition-colors">
                    <td className="p-4 font-bold text-primary">{pac.nombre} <span className="text-outline text-xs font-normal">#{pac.id_mascota}</span></td>
                    <td className="p-4">{pac.tipo} • {pac.raza}</td>
                    <td className="p-4">{pac.dueno_nombre}</td>
                    <td className="p-4 text-xs font-bold text-on-surface-variant">
                      {pac.ultima_consulta ? pac.ultima_consulta.split('T')[0] : 'Sin fecha'}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => navigate(`/admin/history/${pac.id_mascota}`)} 
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                      >
                        <span className="material-symbols-outlined text-[16px]">folder_open</span> Abrir Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 italic text-on-surface-variant">Aún no registras consultas médicas a tu nombre.</p>
        )}
      </div>
    </div>
  );
}