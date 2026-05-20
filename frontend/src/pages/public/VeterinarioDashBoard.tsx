import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import logoVetCare2 from '../../assets/logo-VetCare2.jpeg';

interface VeterinarioData {
  id: number;
  nombres: string;
  ap_pat: string;
  correo: string;
  tipo_usuario: string;
  salario: number;
  hora_ingreso: string;
  hora_salida: string;
  especializacion: string;
  titulo: string;
}

export default function VeterinarioDashboard() {
  const navigate = useNavigate();
  const [vet, setVet] = useState<VeterinarioData | null>(null);

  useEffect(() => {
    const sesion = localStorage.getItem('vetcare_sesion_vet');
    if (!sesion) {
      alert("Acceso denegado. Por favor inicia sesión.");
      navigate('/login');
      return;
    }
    const datos = JSON.parse(sesion);
    if (datos.tipo_usuario !== 'VETERINARIO') {
      alert("No tienes los permisos requeridos para este panel.");
      navigate('/login');
      return;
    }
    setVet(datos);
  }, [navigate]);

  if (!vet) return <div className="min-h-screen flex items-center justify-center bg-[#f8fbfa]"><p className="font-display text-primary font-bold animate-pulse">Cargando historial médico...</p></div>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-6 relative bg-[#f8fbfa] overflow-x-hidden">
      <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>

      <nav className="w-full max-w-[1000px] bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-4 flex items-center justify-between z-10 mb-8">
        <div className="flex items-center gap-3">
          <img src={logoVetCare2} alt="VetCare" className="h-10 object-contain rounded-lg" />
          <div>
            <h2 className="font-display text-lg font-bold text-primary leading-none">VetCare</h2>
            <span className="text-[9px] font-bold text-on-surface-variant tracking-wider uppercase">Área Médica</span>
          </div>
        </div>
        <Button variant="outline" className="py-2 px-4 text-xs" onClick={() => { localStorage.removeItem('vetcare_sesion_vet'); navigate('/login'); }}>Cerrar Sesión</Button>
      </nav>

      <main className="bg-white w-full max-w-[1000px] rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8 sm:p-12 relative z-10">
        <header className="border-b border-outline-variant/20 pb-6 mb-8">
          <h1 className="font-display text-3xl font-bold text-primary">¡Bienvenido Dr(a). <span className="text-secondary">{vet.nombres} {vet.ap_pat}</span>! 🩺</h1>
          <p className="font-body text-sm text-on-surface-variant mt-2">Especialista en: <strong className="text-black">{vet.especializacion}</strong> | Título: <strong className="text-black">{vet.titulo}</strong></p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f2f7f5] p-6 rounded-2xl border border-primary/5">
            <h3 className="font-display font-bold text-primary mb-3 flex items-center gap-2"><span className="material-icons text-sm">schedule</span> Turno Laboral</h3>
            <p className="font-body text-xs text-on-surface-variant">Horario: <strong className="text-black">{vet.hora_ingreso || '08:00'} - {vet.hora_salida || '16:00'}</strong></p>
            <p className="font-body text-xs text-on-surface-variant mt-1">ID Personal: <strong className="text-black">{vet.id}</strong></p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/40 shadow-sm col-span-2">
            <h3 className="font-display font-bold text-primary mb-4">Gestión de Pacientes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-primary-container/20 transition-colors">
                <p className="font-display font-bold text-xs text-primary">📋 Consultas Pendientes</p>
              </div>
              <div className="p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-primary-container/20 transition-colors">
                <p className="font-display font-bold text-xs text-primary">💉 Historiales Clínicos</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}