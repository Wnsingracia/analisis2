import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import logoVetCare2 from '../../assets/logo-VetCare2.jpeg';

interface ClienteData {
  id: number;
  nombres: string;
  ap_pat: string;
  correo: string;
  nro_cuenta?: string; // El signo ? significa que es opcional
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<ClienteData | null>(null);

  useEffect(() => {
    // 1. Recuperamos los datos del cliente guardados en el inicio de sesión
    const sesionGuardada = localStorage.getItem('vetcare_sesion');
    
    if (!sesionGuardada) {
      // Si no hay sesión, lo mandamos de patitas a la calle (al login)
      alert("No tienes permiso de estar aquí. Por favor inicia sesión.");
      navigate('/login');
      return;
    }

    setCliente(JSON.parse(sesionGuardada));
  }, [navigate]);

  const handleCerrarSesion = () => {
    localStorage.removeItem('vetcare_sesion'); // Limpiamos la memoria
    navigate('/login');
  };

  // Mientras lee el localStorage, mostramos una pantalla de carga limpia
  if (!cliente) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fbfa]">
        <p className="font-display text-primary font-bold animate-pulse">Cargando tu cuenta VetCare...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-6 relative bg-[#f8fbfa] overflow-x-hidden selection:bg-primary-container selection:text-white">
      
      {/* Patrón de puntos decorativo de fondo */}
      <div className="absolute inset-0 z-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>

      {/* Barra de navegación superior del cliente */}
      <nav className="w-full max-w-[1000px] bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-4 flex items-center justify-between z-10 mb-8">
        <div className="flex items-center gap-3">
          <img src={logoVetCare2} alt="VetCare Logo" className="h-10 object-contain rounded-lg" />
          <div>
            <h2 className="font-display text-lg font-bold text-primary leading-none">VetCare</h2>
            <span className="text-[9px] font-bold text-on-surface-variant tracking-wider uppercase">Paws & Palms</span>
          </div>
        </div>
        <Button variant="outline" className="py-2 px-4 text-xs" onClick={handleCerrarSesion}>
          Cerrar Sesión
        </Button>
      </nav>

      {/* Contenedor Principal */}
      <main className="bg-white w-full max-w-[1000px] rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8 sm:p-12 relative overflow-hidden z-10">
        
        {/* Formas estéticas de fondo */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-surface-container rounded-full -z-10 opacity-60"></div>

        {/* MENSAJE DE BIENVENIDA EXCLUSIVO PARA EL CLIENTE */}
        <header className="border-b border-outline-variant/20 pb-6 mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary tracking-wide">
            ¡Bienvenido cliente, <span className="text-secondary">{cliente.nombres} {cliente.ap_pat}</span>! 👋
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-2">
            Estamos listos para atender a tus consentidos hoy. Este es tu panel de control de VetCare.
          </p>
        </header>

        {/* Cuadrícula de información del Cliente */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tarjeta 1: Datos de Cuenta de la tabla Clientes */}
          <div className="bg-[#f2f7f5] p-6 rounded-2xl border border-primary/5">
            <h3 className="font-display font-bold text-primary mb-3 flex items-center gap-2">
              <span className="material-icons text-sm">badge</span> Datos de Cuenta
            </h3>
            <p className="font-body text-xs text-on-surface-variant">Código Cliente: <strong className="text-black">{cliente.id}</strong></p>
            <p className="font-body text-xs text-on-surface-variant mt-1">Nro. de Cuenta Vet: <strong className="text-black">{cliente.nro_cuenta || 'No asignado'}</strong></p>
            <p className="font-body text-xs text-on-surface-variant mt-1">Correo: <strong className="text-black">{cliente.correo}</strong></p>
          </div>

          {/* Tarjeta 2: Atajos rápidos (Simulado) */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/40 shadow-sm col-span-2">
            <h3 className="font-display font-bold text-primary mb-4">¿Qué deseas hacer hoy?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-primary-container/20 transition-colors">
                <p className="font-display font-bold text-xs text-primary">🐾 Mis Mascotas</p>
                <p className="text-[11px] text-on-surface-variant">Revisa el historial clínico de tus peluditos.</p>
              </div>
              <div className="p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-primary-container/20 transition-colors">
                <p className="font-display font-bold text-xs text-primary">📅 Reservar Cita</p>
                <p className="text-[11px] text-on-surface-variant">Agenda un espacio para Spa o consulta médica.</p>
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}