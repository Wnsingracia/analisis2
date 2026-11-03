import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logoVetCare2 from '../../../assets/logo-VetCare2.jpeg';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// ================= TIPOS =================

interface PerfilCliente {
  nro_cuenta?: string | null;
  usuario?: {
    correo?: string;
    cel?: string | number;
  };
}

// ================= COMPONENTE =================

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { usuario, cargando, cerrarSesion } = useAuth();

  const [perfil, setPerfil] = useState<PerfilCliente>({});
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // ================= VALIDAR SESIÓN =================

  useEffect(() => {
    if (cargando) return;

    if (!usuario || usuario.tipo_usuario !== 'CLIENTE') {
      navigate('/login', { replace: true });
    }
  }, [cargando, usuario, navigate]);

  // ================= CARGAR PERFIL =================

  useEffect(() => {
    if (!usuario || usuario.tipo_usuario !== 'CLIENTE') return;

    let activo = true;

    api
      .get(`/clientes/${usuario.id_usuario}`)
      .then((respuesta) => {
        if (activo) setPerfil(respuesta.data);
      })
      .catch((error) => {
        console.error('No se pudo cargar el perfil del cliente:', error);
        if (activo) setPerfil({});
      });

    return () => {
      activo = false;
    };
  }, [usuario]);

  // ================= CERRAR SESIÓN =================

  const handleCerrarSesion = async () => {
    if (cerrandoSesion) return;

    setCerrandoSesion(true);

    try {
      await cerrarSesion();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  // ================= CARGA =================

  if (cargando || !usuario || usuario.tipo_usuario !== 'CLIENTE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf8]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="font-display text-sm font-bold text-primary">
            Preparando tu experiencia VetCare...
          </p>
        </div>
      </div>
    );
  }

  // ================= DATOS =================

  const nombreCompleto = [
    usuario.nombres,
    usuario.ap_pat,
    usuario.ap_mat,
  ]
    .filter(Boolean)
    .join(' ');

  const nombre = usuario.nombres || 'Cliente';

  const fechaActual = new Date().toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#263a34] selection:bg-primary-container selection:text-white">

      {/* ================= CONTENIDO ================= */}

      <main className="max-w-[1400px] mx-auto px-5 lg:px-10 py-8 lg:py-12">

        {/* ================= BIENVENIDA ================= */}

        <section className="relative overflow-hidden rounded-[2rem] min-h-[390px] lg:min-h-[440px] bg-[#234d40] shadow-xl">

          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1800&q=85"
            alt="Perros disfrutando de un paseo"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#153b30]/95 via-[#153b30]/75 to-[#153b30]/10" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#153b30]/50 to-transparent" />

          <div className="relative z-10 min-h-[390px] lg:min-h-[440px] p-8 sm:p-12 lg:p-16 flex flex-col justify-center">

            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#a7e5bb]" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/80">
                Bienestar y cuidado animal
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.12] max-w-2xl">
              ¡Hola, {nombre}!
              <br />
              <span className="text-[#b5e5c6]">
                Su bienestar es nuestra prioridad.
              </span>
            </h1>

            <p className="text-white/80 text-sm sm:text-base mt">
              Cada mascota merece una vida saludable y llena de cariño.
              En VetCare estamos aquí para acompañarte en cada etapa
              de su cuidado.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">

              <button
                onClick={() => navigate('/cliente/mascotas')}
                className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#edf7f0] hover:-translate-y-0.5 transition-all"
              >
                <span className="material-symbols-outlined">
                  pets
                </span>
                Explorar mis mascotas
              </button>

              <div className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/30 text-white text-sm font-semibold backdrop-blur-sm">
                <span className="material-symbols-outlined text-[#b5e5c6]">
                  calendar_today
                </span>
                <span className="capitalize">{fechaActual}</span>
              </div>

            </div>
          </div>
        </section>

        {/* ================= ACCESOS PRINCIPALES ================= */}

        <section className="mt-12">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Tu espacio personal
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#263a34] mt-2">
                Todo para tus consentidos
              </h2>

              <p className="text-sm text-on-surface-variant mt-2">
                Accede fácilmente a la información y cuidado de tus mascotas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* MIS MASCOTAS - FUNCIONAL */}

            <button
              onClick={() => navigate('/cliente/mascotas')}
              className="group text-left bg-white rounded-[1.5rem] border border-[#e6eee9] shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=85"
                  alt="Perro recibiendo cuidados"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

                <span className="absolute bottom-5 left-6 bg-white/95 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Tu espacio personal
                </span>

                <div className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-white/90 text-primary flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-2xl">
                    pets
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#263a34]">
                      Mis Mascotas
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-2">
                      Consulta los perfiles, información y antecedentes
                      de tus compañeros.
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-primary text-2xl group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            </button>

            {/* CUIDADO Y BIENESTAR - PROMOCIONAL */}

            <div className="group bg-white rounded-[1.5rem] border border-[#e6eee9] shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-52 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=85"
                  alt="Mascota disfrutando de cuidados"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

                <span className="absolute bottom-5 left-6 bg-white/95 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Cuidado integral
                </span>

                <div className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-white/90 text-primary flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-2xl">
                    favorite
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-[#263a34]">
                  Amor, salud y bienestar
                </h3>

                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Los pequeños cuidados de cada día hacen una gran
                  diferencia en la vida de nuestros compañeros.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ================= BANNER PROMOCIONAL ================= */}

        <section className="mt-10 relative overflow-hidden rounded-[1.5rem] bg-[#e8f2ec] p-7 sm:p-10">

          <div className="absolute -right-10 -top-20 w-64 h-64 rounded-full border-[35px] border-primary/5" />
          <div className="absolute right-40 -bottom-32 w-56 h-56 rounded-full bg-white/40" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">

            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-primary mb-3">
                <span className="material-symbols-outlined">
                  volunteer_activism
                </span>

                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  VetCare · Paws & Palms
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#234d40]">
                Su mascota es parte de la familia.
              </h2>

              <p className="text-sm text-[#587166] mt-3 ">
                Nos comprometemos a ofrecer una experiencia de cuidado
                basada en la confianza, la atención y el cariño que
                cada compañero merece.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-4xl">
                  pets
                </span>
              </div>

              <div>
                <p className="font-display text-lg font-bold text-primary">
                  VetCare
                </p>
                <p className="text-xs text-[#587166]">
                  Cuidamos lo que más quieres.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ================= INFORMACIÓN DE CUENTA ================= */}

        <section className="mt-10">

          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary">
              account_circle
            </span>

            <h2 className="font-display text-xl font-bold text-[#263a34]">
              Mi cuenta
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#e6eee9] shadow-sm p-6 sm:p-8">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">
                    badge
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Código de cliente
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-1 break-all">
                    {perfil.nro_cuenta || usuario.id_usuario}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">
                    mail
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Correo electrónico
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-1 break-all">
                    {perfil.usuario?.correo || 'No disponible'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">
                    person
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Nombre del titular
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-1">
                    {nombreCompleto || 'No disponible'}
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-7 pt-5 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-on-surface-variant">
                Tu información de cuenta se obtiene de tu perfil registrado.
              </p>

              <button
                onClick={handleCerrarSesion}
                disabled={cerrandoSesion}
                className="inline-flex items-center justify-center gap-2 text-error text-xs font-bold hover:bg-error/5 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">
                  logout
                </span>
                Cerrar sesión
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* ================= PIE DE PÁGINA ================= */}

      <footer className="border-t border-[#e6eee9] bg-white mt-8">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-7 flex flex-col sm:flex-row items-center justify-between gap-3">

          <div className="flex items-center gap-2">
            <img
              src={logoVetCare2}
              alt="VetCare"
              className="w-7 h-7 object-cover rounded-lg"
            />

            <span className="font-display text-sm font-bold text-primary">
              VetCare · Paws & Palms
            </span>
          </div>

          <p className="text-[11px] text-on-surface-variant text-center">
            Cuidando a quienes hacen especial cada día.
          </p>

          <span className="text-[10px] text-on-surface-variant">
            © {new Date().getFullYear()} VetCare
          </span>

        </div>
      </footer>

    </div>
  );
}
