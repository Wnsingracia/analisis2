import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logoVetCare2 from '../../../assets/logo-VetCare2.jpeg';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Datos que el login no devuelve: salen de /estilistas/:id y /empleados/:id
interface PerfilEstilista {
  rol?: string | null;
  hora_ingreso?: string | null;
  hora_salida?: string | null;
}

export default function EstilistaDashboard() {
  const navigate = useNavigate();
  const { usuario, cargando, cerrarSesion } = useAuth();
  const [perfil, setPerfil] = useState<PerfilEstilista>({});

  // Se espera a que AuthProvider termine de consultar /auth/me;
  // si no, al refrescar la página se redirigiría al login por error.
  useEffect(() => {
    if (cargando) return;
    if (!usuario || usuario.tipo_usuario !== 'ESTILISTA') {
      navigate('/login', { replace: true });
    }
  }, [cargando, usuario, navigate]);

  useEffect(() => {
    if (!usuario || usuario.tipo_usuario !== 'ESTILISTA') return;
    Promise.all([
      api.get(`/estilistas/${usuario.id_usuario}`),
      api.get(`/empleados/${usuario.id_usuario}`),
    ])
      .then(([estilista, empleado]) =>
        setPerfil({
          rol: estilista.data.rol,
          hora_ingreso: empleado.data.hora_ingreso,
          hora_salida: empleado.data.hora_salida,
        }),
      )
      .catch(() => setPerfil({})); // si falla, se muestra lo básico
  }, [usuario]);

  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion(); // borra la cookie en el servidor y limpia el estado
    } catch {
      /* aun si falla la petición, se sale de la pantalla */
    }
    navigate('/login');
  };

  if (cargando || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbfa]">
        <p className="font-display text-primary font-bold animate-pulse">Cargando agenda estética...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-6 relative bg-[#f8fbfa] overflow-x-hidden">
      <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>

      <nav className="w-full max-w-[1000px] bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-4 flex items-center justify-between z-10 mb-8">
        <div className="flex items-center gap-3">
          <img src={logoVetCare2} alt="VetCare" className="h-10 object-contain rounded-lg" />
          <div>
            <h2 className="font-display text-lg font-bold text-primary leading-none">VetCare</h2>
            <span className="text-[9px] font-bold text-on-surface-variant tracking-wider uppercase">Grooming & Spa</span>
          </div>
        </div>
        <Button variant="outline" className="py-2 px-4 text-xs" onClick={() => { localStorage.removeItem('vetcare_sesion_estilista'); navigate('/login'); }}>Cerrar Sesión</Button>
      </nav>

      <main className="bg-white w-full max-w-[1000px] rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8 sm:p-12 relative z-10">
        <header className="border-b border-outline-variant/20 pb-6 mb-8">
          <h1 className="font-display text-3xl font-bold text-primary">¡Bienvenido, <span className="text-secondary">{usuario.nombres} {usuario.ap_pat}</span>! ✂️</h1>
          <p className="font-body text-sm text-on-surface-variant mt-2">Especialidad de Estilo: <strong className="text-black">{perfil.rol}</strong></p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f7f2f5] p-6 rounded-2xl border border-secondary/5">
            <h3 className="font-display font-bold text-primary mb-3 flex items-center gap-2"><span className="material-icons text-sm">content_cut</span> Turno Estética</h3>
            <p className="font-body text-xs text-on-surface-variant">Horario asignado: <strong className="text-black">{perfil.hora_ingreso || '09:00'} - {perfil.hora_salida || '18:00'}</strong></p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/40 shadow-sm col-span-2">
            <h3 className="font-display font-bold text-primary mb-4">Servicios Estéticos de Hoy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-primary-container/20 transition-colors">
                <p className="font-display font-bold text-xs text-primary">🛁 Baños y Cortes en Fila</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}