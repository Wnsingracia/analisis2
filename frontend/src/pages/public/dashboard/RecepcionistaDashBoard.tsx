import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import logoVetCare2 from '../../../assets/logo-VetCare2.jpeg';

interface PerfilRecepcionista {
  departamento?: string | null;
  hora_ingreso?: string | null;
  hora_salida?: string | null;
}

interface Cita {
  id_cita: number;
  fecha?: string;
  hora?: string;
  tipo?: string;
  descripcion?: string;
  id_mascota?: number | string;
  id_cliente?: number | string;
}

interface Mascota {
  id_mascota: number | string;
  id_cliente?: number | string;
  nombre?: string;
  tipo?: string;
}

const extraerLista = (respuesta: any): any[] => {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.data?.items)) return respuesta.data.items;
  if (Array.isArray(respuesta?.items)) return respuesta.items;
  return [];
};

export default function RecepcionistaDashboard() {
  const navigate = useNavigate();
  const { usuario, cargando, cerrarSesion } = useAuth();

  const [perfil, setPerfil] = useState<PerfilRecepcionista>({});
  const [citas, setCitas] = useState<Cita[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Validación de sesión y rol.
  useEffect(() => {
    if (cargando) return;

    if (!usuario || usuario.tipo_usuario !== 'RECEPCIONISTA') {
      navigate('/login', { replace: true });
    }
  }, [cargando, usuario, navigate]);

  // Información del perfil.
  useEffect(() => {
    if (!usuario || usuario.tipo_usuario !== 'RECEPCIONISTA') return;

    Promise.all([
      api.get(`/recepcionistas/${usuario.id_usuario}`),
      api.get(`/empleados/${usuario.id_usuario}`),
    ])
      .then(([recepcionista, empleado]) => {
        setPerfil({
          departamento: recepcionista.data.departamento,
          hora_ingreso: empleado.data.hora_ingreso,
          hora_salida: empleado.data.hora_salida,
        });
      })
      .catch((error) => {
        console.error('Error al cargar perfil:', error);
        setPerfil({});
      });
  }, [usuario]);

  // Datos generales para el panel.
  useEffect(() => {
    if (!usuario || usuario.tipo_usuario !== 'RECEPCIONISTA') return;

    const cargarDatos = async () => {
      setCargandoDatos(true);

      try {
        const [resCitas, resMascotas] = await Promise.all([
          api.get('/citas'),
          api.get('/mascotas'),
        ]);

        setCitas(extraerLista(resCitas.data));
        setMascotas(extraerLista(resMascotas.data));
      } catch (error) {
        console.error('Error al cargar información del dashboard:', error);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatos();
  }, [usuario]);

  const handleCerrarSesion = async () => {
    if (cerrandoSesion) return;

    setCerrandoSesion(true);

    try {
      await cerrarSesion();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  if (cargando || !usuario || usuario.tipo_usuario !== 'RECEPCIONISTA') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbfa] p-4">
        <p className="font-display text-primary font-bold animate-pulse flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Cargando panel de recepción...
        </p>
      </div>
    );
  }

  const nombreCompleto = `${usuario.nombres || ''} ${usuario.ap_pat || ''}`.trim();

  const hoy = new Date();
  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('-');

  const citasHoy = citas.filter((cita) => {
    if (!cita.fecha) return false;
    const fecha = String(cita.fecha).slice(0, 10);
    return fecha === fechaHoy;
  });

  const citasOrdenadas = [...citasHoy].sort((a, b) =>
    String(a.hora || '').localeCompare(String(b.hora || '')),
  );

  const departamento = perfil.departamento || 'Recepción';

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#263b36] overflow-x-hidden">


      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

        {/* Encabezado */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          {/* Presentación principal */}
          <section className="relative overflow-hidden rounded-[2rem] min-h-[390px] lg:min-h-[440px] bg-[#234d40] shadow-xl mb-8">

            <img
              src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1800&q=85"
              alt="Recepción y atención en clínica veterinaria"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#153b30]/95 via-[#153b30]/75 to-[#153b30]/10" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#153b30]/50 to-transparent" />

            <div className="relative z-10 min-h-[390px] lg:min-h-[440px] p-8 sm:p-12 lg:p-16 flex flex-col justify-center">

              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#a7e5bb]" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/80">
                  Centro de atención VetCare · Front Desk
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.12] max-w-2xl">
                ¡Hola, {usuario?.nombres || 'Recepcionista'}!
                <br />
                <span className="text-[#b5e5c6]">
                  Cada detalle hace la diferencia.
                </span>
              </h1>

              <p className="text-white/80 text-sm sm:text-base ">
                Tu organización, amabilidad y compromiso garantizan una atención 
                fluida y acogedora para cada paciente y su familia desde el primer instante.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">

                <button
                  onClick={() => navigate('/recepcionista/citas')}
                  className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#edf7f0] hover:-translate-y-0.5 transition-all"
                >
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                  Gestionar citas de hoy
                </button>

                <div className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/30 text-white text-sm font-semibold backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[#b5e5c6]">
                    calendar_today
                  </span>
                  <span className="capitalize">
                    {hoy.toLocaleDateString('es-BO', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>

              </div>
            </div>
          </section>
        </header>

        {/* Indicadores */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-[#e7eee9] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="h-12 w-12 rounded-xl bg-[#eaf3ed] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#4e8969]">
                  calendar_month
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Agenda diaria
              </span>
            </div>
            <p className="text-xs text-gray-400">Citas programadas para hoy</p>
            <h2 className="text-3xl font-bold text-[#294c40] mt-1">
              {cargandoDatos ? '—' : citasHoy.length}
            </h2>
            <p className="text-[11px] text-gray-400 mt-2">
              Consultas y servicios registrados
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e7eee9] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="h-12 w-12 rounded-xl bg-[#edf1f8] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#718bb6]">
                  pets
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Pacientes
              </span>
            </div>
            <p className="text-xs text-gray-400">Mascotas registradas</p>
            <h2 className="text-3xl font-bold text-[#294c40] mt-1">
              {cargandoDatos ? '—' : mascotas.length}
            </h2>
            <p className="text-[11px] text-gray-400 mt-2">
              Pacientes en el sistema VetCare
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e7eee9] shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-5">
              <div className="h-12 w-12 rounded-xl bg-[#fff3e9] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#d49a61]">
                  support_agent
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Mi departamento
              </span>
            </div>
            <p className="text-xs text-gray-400">Área asignada</p>
            <h2 className="text-2xl font-bold text-[#294c40] mt-1 truncate">
              {departamento}
            </h2>
            <p className="text-[11px] text-gray-400 mt-2">
              {perfil.hora_ingreso || '07:30'} – {perfil.hora_salida || '15:30'}
            </p>
          </div>
        </section>

        {/* Contenido principal */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Agenda */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e7eee9] shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-[#edf1ee] flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-lg text-[#294c40]">
                    Agenda de hoy
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Resumen de las citas registradas.
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#83a38f]">
                  event_note
                </span>
              </div>

              <div className="p-6">
                {cargandoDatos ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Cargando agenda...
                  </p>
                ) : citasOrdenadas.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="material-symbols-outlined text-4xl text-[#c5d6cb]">
                      event_available
                    </span>
                    <p className="font-semibold text-sm text-[#536d60] mt-3">
                      No hay citas registradas para hoy
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Las nuevas citas aparecerán en esta sección.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {citasOrdenadas.slice(0, 5).map((cita) => (
                      <div
                        key={cita.id_cita}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[#f8faf8] border border-[#edf1ee]"
                      >
                        <div className="h-11 w-11 shrink-0 rounded-xl bg-[#e8f2eb] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#5b9270]">
                            pets
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#345344] truncate">
                            {cita.tipo || 'Atención veterinaria'}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1 truncate">
                            {cita.descripcion || 'Sin descripción adicional'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-[#547d65]">
                            {cita.hora || '--:--'}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Cita #{cita.id_cita}
                          </p>
                        </div>
                      </div>
                    ))}
                    {citasOrdenadas.length > 5 && (
                      <p className="text-center text-xs text-gray-400 pt-2">
                        Se muestran 5 de {citasOrdenadas.length} citas.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => navigate('/recepcionista/citas')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#eaf3ed] text-[#47765e] font-bold text-xs hover:bg-[#dcece1] transition-colors"
              >
                <span className="material-symbols-outlined text-base">calendar_month</span>
                Ir a gestión de citas
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Acciones rápidas */}
          <aside className="bg-white rounded-2xl border border-[#e7eee9] shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-[#294c40]">
                Accesos rápidos
              </h2>
              <p className="text-xs text-gray-400 mt-1 mb-6">
                Operaciones frecuentes de recepción.
              </p>

              <button
                onClick={() => navigate('/recepcionista/citas')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#eaf3ed] hover:bg-[#dcece1] transition-colors text-left mb-3"
              >
                <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#54866a]">
                    add_circle
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#345344]">
                    Registrar nueva cita
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Agendar consultas y servicios.
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#7da18a] text-lg">
                  chevron_right
                </span>
              </button>

              <div className="rounded-xl bg-[#f8faf8] border border-[#edf1ee] p-4 mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#7a9c86]">
                    pets
                  </span>
                  <p className="text-xs font-bold text-[#456653]">
                    Atención al paciente
                  </p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Cada registro y cada cita contribuyen a brindar una experiencia organizada y una mejor atención a las mascotas y sus familias.
                </p>
              </div>
            </div>
          </aside>

        </section>

        {/* Banner inferior */}
        <section className="relative overflow-hidden rounded-2xl bg-[#294c40] p-7 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="relative z-10 ">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b9d7c2] mb-2">
              Atención VetCare
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
              Una buena experiencia comienza en recepción.
            </h2>
            <p className="text-xs text-white/75 mt-2 leading-relaxed">
              Organización, amabilidad y compromiso en cada visita.
            </p>
          </div>

          <div className="relative z-10 h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-4xl text-[#c3dfca]">
              volunteer_activism
            </span>
          </div>

          <span className="material-symbols-outlined absolute -right-8 -bottom-12 text-[180px] text-white opacity-[0.04] pointer-events-none">
            pets
          </span>
        </section>

      </main>

      {/* Pie de página */}
      <footer className="border-t border-[#e5ece8] bg-white mt-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src={logoVetCare2}
              alt="VetCare"
              className="h-7 w-7 object-contain rounded"
            />
            <span className="font-bold text-sm text-[#426554]">VetCare</span>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            © {new Date().getFullYear()} VetCare · Atención y bienestar animal.
          </p>

          <span className="text-[10px] font-semibold text-[#8ca69a]">
            Front Desk
          </span>
        </div>
      </footer>

    </div>
  );
}