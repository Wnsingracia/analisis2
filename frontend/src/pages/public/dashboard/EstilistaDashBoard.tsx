import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoVetCare2 from '../../../assets/logo-VetCare2.jpeg';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

interface PerfilEstilista {
  rol?: string | null;
  hora_ingreso?: string | null;
  hora_salida?: string | null;
}

export default function EstilistaDashboard() {
  const navigate = useNavigate();
  const { usuario, cargando, cerrarSesion } = useAuth();

  const [perfil, setPerfil] = useState<PerfilEstilista>({});
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Validación del usuario y su rol.
  useEffect(() => {
    if (cargando) return;

    if (!usuario || usuario.tipo_usuario !== 'ESTILISTA') {
      navigate('/login', { replace: true });
    }
  }, [cargando, usuario, navigate]);

  // Obtener información del estilista y del empleado.
  useEffect(() => {
    if (!usuario || usuario.tipo_usuario !== 'ESTILISTA') return;

    Promise.all([
      api.get(`/estilistas/${usuario.id_usuario}`),
      api.get(`/empleados/${usuario.id_usuario}`),
    ])
      .then(([estilista, empleado]) => {
        setPerfil({
          rol: estilista.data.rol,
          hora_ingreso: empleado.data.hora_ingreso,
          hora_salida: empleado.data.hora_salida,
        });
      })
      .catch((error) => {
        console.error('No se pudo cargar el perfil del estilista:', error);
        setPerfil({});
      });
  }, [usuario]);

  // Cerrar sesión utilizando el contexto de autenticación.
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

  if (cargando || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbfa] p-4">
        <p className="font-display text-primary font-bold animate-pulse flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Preparando tu espacio de estilista...
        </p>
      </div>
    );
  }

  const nombreCompleto = `${usuario.nombres || ''} ${usuario.ap_pat || ''}`.trim();

  return (
    <div className="min-h-screen bg-[#f8fbfa] text-[#263b36] overflow-x-hidden">

      {/* Navegación */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5eeea]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <img
              src={logoVetCare2}
              alt="VetCare"
              className="h-11 w-11 object-contain rounded-xl"
            />

            <div>
              <h2 className="font-display text-xl font-bold text-primary leading-none">
                VetCare
              </h2>
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#8a9c95] uppercase">
                Grooming & Spa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-primary">{nombreCompleto}</p>
              <p className="text-[10px] text-gray-400">Área de estilismo</p>
            </div>

            <button
              onClick={handleCerrarSesion}
              disabled={cerrandoSesion}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e6ece9] text-sm font-semibold text-[#667a72] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span className="hidden sm:inline">
                {cerrandoSesion ? 'Saliendo...' : 'Cerrar sesión'}
              </span>
            </button>
          </div>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8 relative">

        {/* Presentación principal */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#23483d] min-h-[340px] flex items-center shadow-lg mb-8">

          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1800&q=85"
              alt="Cuidado y estética de mascotas"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#183c32] via-[#23483d]/95 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 max-w-2xl">

            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="material-symbols-outlined text-sm">content_cut</span>
              VetCare Grooming Studio
            </span>

            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              ¡Hola, {usuario.nombres}! 
              <span className="block text-[#b8dfc9] mt-2">
                Cada detalle hace la diferencia.
              </span>
            </h1>

            <p className="text-white/75 text-sm sm:text-base leading-relaxed mt-3">
              Tu talento transforma el cuidado de cada mascota en una
              experiencia especial. Bienvenido a tu espacio de estética
              y bienestar animal.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-[#b8dfc9]">pets</span>
                <span className="text-xs font-semibold text-white">
                  Cuidado personalizado
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-[#b8dfc9]">spa</span>
                <span className="text-xs font-semibold text-white">
                  Belleza y bienestar
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Información del perfil */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="bg-white rounded-2xl p-6 border border-[#e8efeb] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="h-12 w-12 rounded-2xl bg-[#e8f3ed] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#3b8064]">
                  badge
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#91a39a]">
                Mi especialidad
              </span>
            </div>

            <p className="text-xs text-gray-400 font-medium mb-1">
              Área de trabajo
            </p>
            <h3 className="text-xl font-bold text-[#294c40]">
              {perfil.rol || 'Estilista VetCare'}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Especialización en estética y cuidado animal.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e8efeb] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="h-12 w-12 rounded-2xl bg-[#fff2e8] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#d28a53]">
                  schedule
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#91a39a]">
                Jornada laboral
              </span>
            </div>

            <p className="text-xs text-gray-400 font-medium mb-1">
              Horario asignado
            </p>
            <h3 className="text-xl font-bold text-[#294c40]">
              {perfil.hora_ingreso || '09:00'} – {perfil.hora_salida || '18:00'}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Tu horario registrado en VetCare.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e8efeb] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="h-12 w-12 rounded-2xl bg-[#f4edf8] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#9874ad]">
                  volunteer_activism
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#91a39a]">
                Nuestro compromiso
              </span>
            </div>

            <p className="text-xs text-gray-400 font-medium mb-1">
              Filosofía VetCare
            </p>
            <h3 className="text-xl font-bold text-[#294c40]">
              Calidad y dedicación
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Cada mascota merece un cuidado especial.
            </p>
          </div>

        </section>

        {/* Servicios destacados */}
        <section className="mb-10">

          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8ca69a] mb-2">
                Grooming & Spa
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#294c40]">
                Un mundo de cuidado y estilo
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Conoce algunas de las experiencias que ofrecemos.
              </p>
            </div>

            <span className="text-xs font-semibold text-[#71917f]">
              Belleza · Higiene · Bienestar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Servicio 1 */}
            <article className="group bg-white rounded-2xl overflow-hidden border border-[#e8efeb] shadow-sm hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=85"
                  alt="Baño para mascotas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-[#63977a] mb-3">
                  <span className="material-symbols-outlined text-lg">bathtub</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Higiene
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#294c40]">
                  Baños y limpieza
                </h3>
                <p className="text-xs leading-relaxed text-gray-400 mt-2">
                  Una experiencia de limpieza y frescura para mantener
                  el bienestar y la comodidad de cada mascota.
                </p>
              </div>
            </article>

            {/* Servicio 2 */}
            <article className="group bg-white rounded-2xl overflow-hidden border border-[#e8efeb] shadow-sm hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=85"
                  alt="Estilismo de mascotas"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-[#c18b65] mb-3">
                  <span className="material-symbols-outlined text-lg">content_cut</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Estilismo
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#294c40]">
                  Cortes y peluquería
                </h3>
                <p className="text-xs leading-relaxed text-gray-400 mt-2">
                  Estilos adaptados a las características y necesidades
                  de cada compañero de cuatro patas.
                </p>
              </div>
            </article>

            {/* Servicio 3 */}
            <article className="group bg-white rounded-2xl overflow-hidden border border-[#e8efeb] shadow-sm hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=85"
                  alt="Cuidado y bienestar de mascotas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-[#9874ad] mb-3">
                  <span className="material-symbols-outlined text-lg">spa</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Bienestar
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#294c40]">
                  Cuidado integral
                </h3>
                <p className="text-xs leading-relaxed text-gray-400 mt-2">
                  Atención dedicada a los pequeños detalles que hacen
                  que cada visita sea una experiencia agradable.
                </p>
              </div>
            </article>

          </div>
        </section>

        {/* Mensaje de marca */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#e9f2ec] p-8 sm:p-10 mb-8">

          <div className="absolute -right-10 -bottom-16 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[220px] text-[#315c49]">
              pets
            </span>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-[#67947a] mb-3">
              <span className="material-symbols-outlined text-3xl">verified</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Asombroso Cuidado</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#294c40]">
              Más que estética, creamos experiencias.
            </h2>

            <p className="text-sm text-[#71877c] leading-relaxed mt-3">
              En VetCare creemos que el cuidado de una mascota va más
              allá de su apariencia. Tu dedicación y profesionalismo
              ayudan a que cada visita sea una experiencia de confianza,
              cariño y bienestar.
            </p>

            <div className="flex items-center gap-2 mt-6 text-[#47765e]">
              <span className="material-symbols-outlined text-lg">favorite</span>
              <span className="text-xs font-bold tracking-wide">
                Cuidamos con amor, estilizamos con pasión.
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* Pie de página */}
      <footer className="border-t border-[#e5eeea] bg-white">
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
            © {new Date().getFullYear()} VetCare · Grooming & Spa.
            Todos los derechos reservados.
          </p>

          <span className="text-[10px] font-semibold text-[#8ca69a]">
            Cuidado y bienestar animal
          </span>

        </div>
      </footer>

    </div>
  );
}