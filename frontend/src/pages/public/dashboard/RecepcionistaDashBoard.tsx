import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import logoVetCare2 from '../../../assets/logo-VetCare2.jpeg';

interface PerfilRecepcionista {
  departamento?: string | null;
  hora_ingreso?: string | null;
  hora_salida?: string | null;
}

export default function RecepcionistaDashboard() {
  const navigate = useNavigate();
  // La sesión vive en AuthContext (cookie httpOnly validada por /auth/me), no en localStorage
  const { usuario, cargando, cerrarSesion } = useAuth();
  const [perfil, setPerfil] = useState<PerfilRecepcionista>({});

  useEffect(() => {
    if (cargando) return;
    if (!usuario || usuario.tipo_usuario !== 'RECEPCIONISTA') {
      navigate('/login', { replace: true });
    }
  }, [cargando, usuario, navigate]);

  useEffect(() => {
    if (!usuario || usuario.tipo_usuario !== 'RECEPCIONISTA') return;
    Promise.all([
      api.get(`/recepcionistas/${usuario.id_usuario}`),
      api.get(`/empleados/${usuario.id_usuario}`),
    ])
      .then(([recepcionista, empleado]) =>
        setPerfil({
          departamento: recepcionista.data.departamento,
          hora_ingreso: empleado.data.hora_ingreso,
          hora_salida: empleado.data.hora_salida,
        }),
      )
      .catch(() => setPerfil({})); // si falla, se muestra lo básico
  }, [usuario]);

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    navigate('/login');
  };

  const recepcionista =
    usuario && usuario.tipo_usuario === 'RECEPCIONISTA'
      ? { ...usuario, ...perfil }
      : null;

  if (!recepcionista) return <div className="min-h-screen flex items-center justify-center bg-[#f8fbfa]"><p className="font-display text-primary font-bold animate-pulse">Cargando canal de atención...</p></div>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-6 relative bg-[#f8fbfa] overflow-x-hidden">
      <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>

      <nav className="w-full max-w-[1000px] bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-4 flex items-center justify-between z-10 mb-8">
        <div className="flex items-center gap-3">
          <img src={logoVetCare2} alt="VetCare" className="h-10 object-contain rounded-lg" />
          <div>
            <h2 className="font-display text-lg font-bold text-primary leading-none">VetCare</h2>
            <span className="text-[9px] font-bold text-on-surface-variant tracking-wider uppercase">Front Desk</span>
          </div>
        </div>
        <Button variant="outline" className="py-2 px-4 text-xs" onClick={handleCerrarSesion}>Cerrar Sesión</Button>
      </nav>

      <main className="bg-white w-full max-w-[1000px] rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8 sm:p-12 relative z-10">
        <header className="border-b border-outline-variant/20 pb-6 mb-8">
          <h1 className="font-display text-3xl font-bold text-primary">¡Bienvenido(a), <span className="text-secondary">{recepcionista.nombres} {recepcionista.ap_pat}</span>! 🛎️</h1>
          <p className="font-body text-sm text-on-surface-variant mt-2">Módulo: <strong className="text-black">{recepcionista.departamento || 'Recepción'}</strong></p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f2f5f7] p-6 rounded-2xl border border-tertiary/5">
            <h3 className="font-display font-bold text-primary mb-3 flex items-center gap-2"><span className="material-icons text-sm">support_agent</span> Horario Control</h3>
            <p className="font-body text-xs text-on-surface-variant">Turno Activo: <strong className="text-black">{recepcionista.hora_ingreso || '07:30'} - {recepcionista.hora_salida || '15:30'}</strong></p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/40 shadow-sm col-span-2">
            <h3 className="font-display font-bold text-primary mb-4">Operaciones de Recepción</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => navigate('/recepcionista/appointments')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/recepcionista/appointments');
                }
              }}
              className="p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-primary-container/20 transition-colors border border-transparent hover:border-primary/20"
            >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    calendar_add_on
                  </span>
                  <div>
                    <p className="font-display font-bold text-sm text-primary">
                      Registrar Nueva Cita
                    </p>
                    <p className="font-body text-xs text-on-surface-variant mt-1">
                      Agendar consultas, cirugías y servicios de estética.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}