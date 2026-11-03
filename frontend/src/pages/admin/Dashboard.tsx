import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// ================= TIPOS =================

interface Mascota {
  id_mascota: string | number;
  id_cliente?: string | number;
  nombre?: string | null;
  tipo?: string | null;
  raza?: string | null;
}

interface Cliente {
  id_usuario: string | number;
}

interface Cita {
  id_cita: string | number;
  fecha?: string | null;
  hora?: string | null;
  tipo?: string | null;
  descripcion?: string | null;
  costo?: number | string | null;
  id_mascota?: string | number | null;
  id_cliente?: string | number | null;
  mascota?: Mascota;
}

interface Estadisticas {
  citasHoy: number;
  mascotas: number;
  clientes: number;
}

// ================= UTILIDADES =================

const extraerLista = <T,>(respuesta: any): T[] => {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.items)) return respuesta.items;
  if (Array.isArray(respuesta?.data?.items)) return respuesta.data.items;
  return [];
};

const obtenerFechaLocal = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};

const normalizarFecha = (fecha?: string | null) => {
  if (!fecha) return '';

  const valor = String(fecha).trim().slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    const [dia, mes, anio] = valor.split('/');
    return `${anio}-${mes}-${dia}`;
  }

  return '';
};

const formatearHora = (hora?: string | null) => {
  if (!hora) return 'Sin hora';

  return String(hora).slice(0, 5);
};

const obtenerNombreCompleto = (usuario: any) =>
  [usuario?.nombres, usuario?.ap_pat, usuario?.ap_mat]
    .filter(Boolean)
    .join(' ') || 'Administrador';

// ================= COMPONENTE =================

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario, cargando } = useAuth();

  const [citas, setCitas] = useState<Cita[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorDatos, setErrorDatos] = useState('');

  const esAdmin = usuario?.tipo_usuario === 'ADMIN';

  // ================= VALIDAR SESIÓN =================

  useEffect(() => {
    if (cargando) return;

    if (!usuario || usuario.tipo_usuario !== 'ADMIN') {
      navigate('/login', { replace: true });
    }
  }, [cargando, usuario, navigate]);

  // ================= CARGAR INFORMACIÓN =================

  useEffect(() => {
    if (cargando || !esAdmin) return;

    let activo = true;

    const cargarDashboard = async () => {
      setCargandoDatos(true);
      setErrorDatos('');

      try {
        const [citasRes, mascotasRes, clientesRes] = await Promise.all([
          api.get('/citas'),
          api.get('/mascotas'),
          api.get('/clientes'),
        ]);

        if (!activo) return;

        setCitas(extraerLista<Cita>(citasRes.data));
        setMascotas(extraerLista<Mascota>(mascotasRes.data));
        setClientes(extraerLista<Cliente>(clientesRes.data));
      } catch (error: any) {
        if (!activo) return;

        console.error('Error cargando dashboard:', error);

        setErrorDatos(
          error?.response?.data?.message ||
          error?.response?.data?.mensaje ||
          'No se pudo obtener la información del panel administrativo.',
        );
      } finally {
        if (activo) setCargandoDatos(false);
      }
    };

    cargarDashboard();

    return () => {
      activo = false;
    };
  }, [cargando, esAdmin]);

  // ================= DATOS CALCULADOS =================

  const fechaHoy = obtenerFechaLocal();

  const citasHoy = useMemo(
    () =>
      citas
        .filter((cita) => normalizarFecha(cita.fecha) === fechaHoy)
        .sort((a, b) =>
          formatearHora(a.hora).localeCompare(formatearHora(b.hora)),
        ),
    [citas, fechaHoy],
  );

  const estadisticas: Estadisticas = {
    citasHoy: citasHoy.length,
    mascotas: mascotas.length,
    clientes: clientes.length,
  };

  const mapaMascotas = useMemo(() => {
    const mapa = new Map<string, Mascota>();

    mascotas.forEach((mascota) => {
      const clave = `${mascota.id_mascota}_${mascota.id_cliente}`;
      mapa.set(clave, mascota);
    });

    return mapa;
  }, [mascotas]);

  const fechaActual = new Date().toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // ================= ESTADOS DE CARGA =================

  if (cargando || !usuario || !esAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="text-sm font-semibold text-on-surface-variant">
            Verificando acceso administrativo...
          </p>
        </div>
      </div>
    );
  }

  // ================= RENDER =================

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* ================= ENCABEZADO ================= */}

      <header className="relative overflow-hidden rounded-[2rem] bg-primary text-white p-7 md:p-10 shadow-ambient">

        <div className="absolute -right-16 -top-24 w-80 h-80 rounded-full border-[40px] border-white/5" />
        <div className="absolute right-28 -bottom-32 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/70">
                Centro de administración
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-3">
              Panel General
            </h1>

            <p className="text-white/75 text-sm md:text-base">
              Bienvenido de nuevo,{' '}
              <strong className="text-white">
                {obtenerNombreCompleto(usuario)}
              </strong>.
              Aquí puedes supervisar la actividad de VetCare y acceder
              rápidamente a sus principales módulos.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">

              <Link
                to="/admin/appointments"
                className="inline-flex items-center gap-2 bg-white text-primary px-5 py-3 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[19px]">
                  calendar_month
                </span>
                Gestionar citas
              </Link>

              <Link
                to="/admin/clients"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">
                  groups
                </span>
                Ver clientes
              </Link>

            </div>
          </div>

          <div className="shrink-0 lg:text-right">
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-5 py-4 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">
                  calendar_today
                </span>
              </div>

              <div className="text-left lg:text-right">
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/60">
                  Fecha actual
                </p>
                <p className="font-bold capitalize text-sm mt-1">
                  {fechaActual}
                </p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ================= ESTADÍSTICAS ================= */}

      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-on-surface">
              Resumen del sistema
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Indicadores obtenidos de los registros actuales.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            disabled={cargandoDatos}
            className="inline-flex items-center gap-2 text-primary text-xs font-bold hover:opacity-70 disabled:opacity-40"
          >
            <span className={`material-symbols-outlined text-lg ${cargandoDatos ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* CITAS */}

          <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-on-surface-variant">
                  Citas de hoy
                </p>

                <h3 className="font-display text-4xl font-bold text-on-surface mt-3">
                  {cargandoDatos ? '—' : estadisticas.citasHoy}
                </h3>

                <p className="text-xs text-on-surface-variant mt-2">
                  Actividad programada para hoy
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">
                  calendar_month
                </span>
              </div>
            </div>
          </div>

          {/* MASCOTAS */}

          <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-on-surface-variant">
                  Mascotas registradas
                </p>

                <h3 className="font-display text-4xl font-bold text-on-surface mt-3">
                  {cargandoDatos ? '—' : estadisticas.mascotas}
                </h3>

                <p className="text-xs text-on-surface-variant mt-2">
                  Pacientes registrados en VetCare
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">
                  pets
                </span>
              </div>
            </div>
          </div>

          {/* CLIENTES */}

          <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-on-surface-variant">
                  Clientes registrados
                </p>

                <h3 className="font-display text-4xl font-bold text-on-surface mt-3">
                  {cargandoDatos ? '—' : estadisticas.clientes}
                </h3>

                <p className="text-xs text-on-surface-variant mt-2">
                  Propietarios registrados en el sistema
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">
                  groups
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= CONTENIDO PRINCIPAL ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* AGENDA DEL DÍA */}

        <section className="xl:col-span-8 bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">

          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20">

            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  event_note
                </span>
                <h2 className="font-display text-xl font-bold text-on-surface">
                  Agenda del día
                </h2>
              </div>

              <p className="text-xs text-on-surface-variant mt-1">
                Citas registradas para la fecha actual.
              </p>
            </div>

            <Link
              to="/admin/appointments"
              className="text-primary text-sm font-bold hover:underline inline-flex items-center gap-1"
            >
              Ver todas las citas
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </Link>

          </div>

          {errorDatos ? (

            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-error">
                cloud_off
              </span>
              <p className="font-bold text-on-surface mt-3">
                No se pudo cargar la agenda
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                {errorDatos}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-sm font-bold text-primary hover:underline"
              >
                Reintentar
              </button>
            </div>

          ) : cargandoDatos ? (

            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary animate-spin">
                progress_activity
              </span>
              <p className="text-sm text-on-surface-variant">
                Cargando citas...
              </p>
            </div>

          ) : citasHoy.length === 0 ? (

            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                  event_available
                </span>
              </div>

              <h3 className="font-bold text-on-surface">
                No hay citas para hoy
              </h3>

              <p className="text-sm text-on-surface-variant mt-1 ">
                Cuando se registren citas para esta fecha, aparecerán
                automáticamente en esta agenda.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead>
                  <tr className="bg-surface-container-low/60">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Hora
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Servicio
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Registro
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-outline-variant/20">

                  {citasHoy.map((cita) => {
                    const clave = `${cita.id_mascota}_${cita.id_cliente}`;

                    const mascota =
                      mapaMascotas.get(clave) || cita.mascota;

                    return (
                      <tr
                        key={cita.id_cita}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                            <span className="material-symbols-outlined text-primary text-lg">
                              schedule
                            </span>
                            {formatearHora(cita.hora)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[150px]">
                            <div className="w-9 h-9 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined">
                                pets
                              </span>
                            </div>

                            <div>
                              <p className="text-sm font-bold text-on-surface">
                                {mascota?.nombre || 'Mascota sin identificar'}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                {[mascota?.tipo, mascota?.raza]
                                  .filter(Boolean)
                                  .join(' · ') || 'Sin información adicional'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-on-surface-variant min-w-[120px]">
                            {cita.tipo || cita.descripcion || 'Sin especificar'}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Registrada
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>

          )}

          {!cargandoDatos && !errorDatos && citasHoy.length > 0 && (
            <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/30">
              <p className="text-xs text-on-surface-variant">
                Se muestran {citasHoy.length} citas correspondientes a hoy.
              </p>
            </div>
          )}

        </section>

        {/* ACCESOS RÁPIDOS */}

        <aside className="xl:col-span-4 flex flex-col gap-6">

          <section className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6">

            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary">
                dashboard_customize
              </span>
              <h2 className="font-display text-xl font-bold text-on-surface">
                Accesos rápidos
              </h2>
            </div>

            <div className="flex flex-col gap-3">

              <Link
                to="/admin/appointments"
                className="group flex items-center gap-4 p-4 rounded-xl border border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">
                    Administración de citas
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Consultar y gestionar citas
                  </p>
                </div>

                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">
                  chevron_right
                </span>
              </Link>

              <Link
                to="/admin/clients"
                className="group flex items-center gap-4 p-4 rounded-xl border border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">
                    groups
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">
                    Clientes y mascotas
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Consultar propietarios y pacientes
                  </p>
                </div>

                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">
                  chevron_right
                </span>
              </Link>

              <Link
                to="/admin"
                className="group flex items-center gap-4 p-4 rounded-xl border border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">
                    settings
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">
                    Panel administrativo
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Navegar por los módulos del sistema
                  </p>
                </div>

                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">
                  chevron_right
                </span>
              </Link>

            </div>
          </section>

          {/* ESTADO DEL PANEL */}

          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">

            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">
                verified_user
              </span>
              <h3 className="font-bold text-on-surface text-sm">
                Sesión administrativa
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-on-surface-variant">
                Sesión autenticada
              </span>
            </div>

            <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
              El acceso a este panel está reservado para usuarios con
              permisos de administrador.
            </p>

          </section>

        </aside>

      </div>

    </div>
  );
}
