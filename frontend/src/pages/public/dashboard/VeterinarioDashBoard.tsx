import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoVetCare2 from '../../../assets/logo-VetCare2.jpeg';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

interface PerfilVeterinario {
  especializacion?: string | null;
  titulo?: string | null;
  hora_ingreso?: string | null;
  hora_salida?: string | null;
}

export default function VeterinarioDashboard() {
  const navigate = useNavigate();
  const { usuario, cargando, cerrarSesion } = useAuth();

  const [perfil, setPerfil] = useState<PerfilVeterinario>({});
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Validar sesión y rol.
  useEffect(() => {
    if (cargando) return;

    if (!usuario || usuario.tipo_usuario !== 'VETERINARIO') {
      navigate('/login', { replace: true });
    }
  }, [cargando, usuario, navigate]);

  // Obtener información profesional y horario laboral.
  useEffect(() => {
    if (!usuario || usuario.tipo_usuario !== 'VETERINARIO') return;

    Promise.all([
      api.get(`/veterinarios/${usuario.id_usuario}`),
      api.get(`/empleados/${usuario.id_usuario}`),
    ])
      .then(([vet, empleado]) => {
        setPerfil({
          especializacion: vet.data.especializacion,
          titulo: vet.data.titulo,
          hora_ingreso: empleado.data.hora_ingreso,
          hora_salida: empleado.data.hora_salida,
        });
      })
      .catch((error) => {
        console.error('Error al cargar el perfil veterinario:', error);
        setPerfil({});
      });
  }, [usuario]);

  // Cierre de sesión mediante AuthContext.
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

  if (cargando || !usuario || usuario.tipo_usuario !== 'VETERINARIO') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf8] p-4">
        <p className="font-display text-primary font-bold animate-pulse flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Preparando tu espacio médico...
        </p>
      </div>
    );
  }

  const nombreCompleto = `${usuario.nombres || ''} ${usuario.ap_pat || ''}`.trim();

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#263b36] overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

        {/* Encabezado */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8ca69a] mb-2">
              Centro médico veterinario
            </p>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#294c40] flex flex-wrap items-center gap-2">
              <span>Bienvenido(a), Dr(a). {usuario.nombres}</span>
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Tu espacio profesional para el cuidado y la salud animal.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#e5ece8] rounded-xl px-4 py-3 shrink-0">
            <span className="material-symbols-outlined text-[#6e9b80] text-lg">
              medical_services
            </span>
            <span className="text-xs font-semibold text-gray-600">
              Panel veterinario
            </span>
          </div>
        </header>

        {/* Presentación médica */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#23483d] min-h-[310px] flex items-center shadow-lg mb-8">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1800&q=85"
              alt="Atención veterinaria"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#183c32] via-[#23483d]/95 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="material-symbols-outlined text-sm">health_and_safety</span>
              Medicina veterinaria
            </span>

            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              La salud de cada paciente
              <span className="block text-[#b8dfc9] mt-2">
                está en buenas manos.
              </span>
            </h2>

            <p className="text-white/75 text-sm sm:text-base leading-relaxed mt-3">
              Gestiona la atención médica, consulta los antecedentes clínicos
              y acompaña a cada mascota en su camino hacia una vida saludable.
            </p>

            <button
              onClick={() => navigate('/veterinario/MisPacientes')}
              className="mt-7 inline-flex items-center gap-2 bg-white text-[#315d48] font-bold text-xs px-5 py-3.5 rounded-xl hover:bg-[#eaf4ed] transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-base">pets</span>
              Consultar mis pacientes
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Información profesional */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-[#e7eee9] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="h-12 w-12 rounded-xl bg-[#eaf3ed] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#4e8969]">
                  medical_services
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Especialidad
              </span>
            </div>

            <p className="text-xs text-gray-400">Área profesional</p>
            <h3 className="text-lg font-bold text-[#294c40] mt-1 truncate">
              {perfil.especializacion || 'Medicina veterinaria'}
            </h3>
            <p className="text-[11px] text-gray-400 mt-2">
              Especialización registrada en el sistema.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e7eee9] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="h-12 w-12 rounded-xl bg-[#edf1f8] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#718bb6]">
                  school
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Formación
              </span>
            </div>

            <p className="text-xs text-gray-400">Título profesional</p>
            <h3 className="text-lg font-bold text-[#294c40] mt-1 truncate">
              {perfil.titulo || 'Profesional veterinario'}
            </h3>
            <p className="text-[11px] text-gray-400 mt-2">
              Información de tu perfil profesional.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e7eee9] shadow-sm sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-5">
              <div className="h-12 w-12 rounded-xl bg-[#fff3e9] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#d49a61]">
                  schedule
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Jornada laboral
              </span>
            </div>

            <p className="text-xs text-gray-400">Horario asignado</p>
            <h3 className="text-lg font-bold text-[#294c40] mt-1">
              {perfil.hora_ingreso || '08:00'} – {perfil.hora_salida || '16:00'}
            </h3>
            <p className="text-[11px] text-gray-400 mt-2">
              Horario registrado en VetCare.
            </p>
          </div>
        </section>

        {/* Gestión clínica */}
        <section className="mb-10">
          <div className="mb-6">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8ca69a] mb-2">
              Área de trabajo
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#294c40]">
              Gestión clínica
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Accede a las herramientas principales para la atención de tus pacientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pacientes */}
            <button
              onClick={() => navigate('/veterinario/MisPacientes')}
              className="group text-left bg-white rounded-2xl border border-[#e7eee9] shadow-sm overflow-hidden hover:shadow-lg hover:border-[#b8d5c1] transition-all flex flex-col justify-between"
            >
              <div className="h-40 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=85"
                  alt="Pacientes veterinarios"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c4032]/70 to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined">pets</span>
                  <span className="text-sm font-bold">Mis pacientes</span>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between w-full">
                <div>
                  <h3 className="font-bold text-[#294c40]">
                    Pacientes asignados
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Consulta la información de las mascotas.
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#71977e] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>

            {/* Historial clínico */}
            <button
              onClick={() => navigate('/veterinario/MisPacientes')}
              className="group text-left bg-white rounded-2xl border border-[#e7eee9] shadow-sm overflow-hidden hover:shadow-lg hover:border-[#b8d5c1] transition-all flex flex-col justify-between"
            >
              <div className="h-40 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1000&q=85"
                  alt="Atención médica veterinaria"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c4032]/70 to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined">description</span>
                  <span className="text-sm font-bold">Historiales clínicos</span>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between w-full">
                <div>
                  <h3 className="font-bold text-[#294c40]">
                    Antecedentes médicos
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Revisa la evolución y los registros clínicos.
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#71977e] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Mensaje institucional */}
        <section className="relative overflow-hidden rounded-2xl bg-[#e9f2ec] p-8 sm:p-10 mb-8">
          <div className="relative z-10 max-w-2xl">
            <span className="material-symbols-outlined text-3xl text-[#67947a] mb-3">
              volunteer_activism
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#294c40]">
              Cada paciente tiene una historia. Tú ayudas a cuidar su futuro.
            </h2>

            <p className="text-sm text-[#71877c] leading-relaxed mt-3">
              En VetCare valoramos el compromiso, la vocación y la dedicación
              de nuestros profesionales. Gracias por formar parte de un equipo
              que trabaja por la salud y el bienestar de cada mascota.
            </p>
          </div>

          <span className="material-symbols-outlined absolute -right-8 -bottom-12 text-[190px] text-[#315c49] opacity-[0.06] pointer-events-none">
            health_and_safety
          </span>
        </section>

      </main>

      {/* Pie de página */}
      <footer className="border-t border-[#e5ece8] bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src={logoVetCare2}
              alt="VetCare"
              className="h-7 w-7 object-contain rounded"
            />
            <span className="font-bold text-sm text-[#426554]">
              VetCare
            </span>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            © {new Date().getFullYear()} VetCare · Medicina veterinaria.
            Todos los derechos reservados.
          </p>

          <span className="text-[10px] font-semibold text-[#8ca69a]">
            Veterinary Care
          </span>
        </div>
      </footer>

    </div>
  );
}