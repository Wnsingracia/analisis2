import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';

// ================= MOCK DATA (Simulando la BD) =================
const mockPetProfile = {
  idMascota: 'm1', idCliente: '201', nombre: 'Rex', tipo: 'Perro', raza: 'Pastor aleman', 
  edad: '3 años', peso: '10 kg', altura: '100 cm', alergias: 'Sensibilidad a la Penicilina', genero: 'M',
  duenoNombre: 'Carlos Mendoza', duenoCel: '71234567'
};

const mockConsultations = [
  { idConsMedica: 'cm1', fecha: '2026-05-18', hora: '10:30', costo: '150.00', especialidad: 'Medicina General', hambiente: 'Consultorio 1', idVeterinario: '101', idCita: '501', diagnostico: 'Amigdalitis canina leve.' },
  { idConsMedica: 'cm2', fecha: '2025-11-10', hora: '16:00', costo: '120.00', especialidad: 'Dermatología', hambiente: 'Consultorio 2', idVeterinario: '105', idCita: '402', diagnostico: 'Dermatitis alérgica por picadura de pulga.' },
];

const mockTreatments = [
  { idTratamiento: 't1', idConsMedica: 'cm1', descripcion: 'Tratamiento antibiótico para infección de garganta', fechaEmision: '2026-05-18' },
];

export default function ClinicalHistory() {
  // En un entorno real, usarías idMascota para hacer un fetch a la BD
  // const { idMascota } = useParams();
  const pet = mockPetProfile;

  // ================= ESTADOS =================
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  // Formulario mapeado a: CONSULTA_MEDICA(idConsMedica,fecha,hora,costo,espelidad,hambiente,idVeterinario,idCita)
  const emptyConsultForm = { fecha: '', hora: '', costo: '', especialidad: 'Medicina General', hambiente: '', idVeterinario: '', idCita: '' };
  const [consultForm, setConsultForm] = useState(emptyConsultForm);

  // ================= HANDLERS =================
  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Guardando Consulta Médica en BD:", consultForm);
    setIsConsultModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setConsultForm({ ...consultForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col h-full relative overflow-y-auto">
      
      {/* ================= CABECERA CON BOTÓN DE RETROCESO ================= */}
      <header className="pb-6 flex flex-col gap-4 flex-shrink-0 border-b border-outline-variant/30 mb-6">
        <Link to="/admin/clients" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-body text-sm font-bold w-fit transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a Clientes y Mascotas
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-1">Historial Clínico</h2>
            <p className="font-body text-lg text-on-surface-variant flex items-center gap-2">
              Paciente: <span className="font-bold text-on-surface">{pet.nombre}</span> 
              <span className="bg-surface-container-high px-2 py-0.5 rounded-md text-xs">ID: #{pet.idMascota}</span>
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsConsultModalOpen(true)} className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl shadow-ambient">
            <span className="material-symbols-outlined font-bold text-[20px]">medical_services</span>
            NUEVA CONSULTA
          </Button>
        </div>
      </header>

      {/* ================= ESTRUCTURA DE 3 COLUMNAS (Basada en tu referencia) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">

        {/* --- COLUMNA 1: PERFIL Y SIGNOS VITALES (lg:col-span-3) --- */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Tarjeta de Perfil */}
          <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-4 border-4 border-surface">
              <span className="material-symbols-outlined text-5xl">cruelty_free</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-on-surface">{pet.nombre}</h3>
            <p className="font-body text-sm text-on-surface-variant mb-4">{pet.tipo} • {pet.raza}</p>
            
            <div className="w-full grid grid-cols-2 gap-2 text-left bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 font-body text-sm mb-4">
              <div><span className="text-on-surface-variant text-xs block">Edad</span><span className="font-bold text-on-surface">{pet.edad}</span></div>
              <div><span className="text-on-surface-variant text-xs block">Género</span><span className="font-bold text-on-surface">{pet.genero === 'M' ? 'Macho' : 'Hembra'}</span></div>
            </div>

            <div className="w-full pt-4 border-t border-outline-variant/30 text-left">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider block mb-1">Dueño Responsable</span>
              <p className="font-body text-sm font-bold text-on-surface flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span> {pet.duenoNombre}</p>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">{pet.duenoCel}</p>
            </div>
          </div>

          {/* Tarjeta de Signos Vitales (Desde tabla MASCOTA) */}
          <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 overflow-hidden">
            <div className="bg-surface-container-lowest px-5 py-3 border-b border-outline-variant/30">
              <h4 className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Últimos Signos Vitales</h4>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-3 text-secondary"><span className="material-symbols-outlined">height</span><span className="font-body text-sm text-on-surface-variant">Altura</span></div>
                <span className="font-body font-bold text-on-surface">{pet.altura}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-tertiary"><span className="material-symbols-outlined">scale</span><span className="font-body text-sm text-on-surface-variant">Peso</span></div>
                <span className="font-body font-bold text-on-surface">{pet.peso}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- COLUMNA 2: ANTECEDENTES Y TRATAMIENTOS (lg:col-span-5) --- */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Tarjeta de Alergias (Adaptado de la referencia visual roja/verde) */}
          <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 overflow-hidden flex flex-col h-full">
            <div className="bg-surface-container-lowest px-5 py-4 border-b border-outline-variant/30">
              <h4 className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-error">coronavirus</span> Antecedentes & Alergias
              </h4>
            </div>
            <div className="p-6 flex-1">
              {pet.alergias && pet.alergias !== 'Ninguna' ? (
                <div className="bg-error-container/20 border border-error/30 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-error shrink-0">warning</span>
                  <div>
                    <h5 className="font-body text-sm font-bold text-error mb-1">Alergias Registradas:</h5>
                    <p className="font-body text-sm text-on-surface-variant">{pet.alergias}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#4CAF50] shrink-0">check_circle</span>
                  <div>
                    <h5 className="font-body text-sm font-bold text-[#4CAF50] mb-1">Sin alergias conocidas</h5>
                    <p className="font-body text-sm text-on-surface-variant">Paciente sin reportes de reacciones adversas.</p>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h5 className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">Tratamientos Activos / Previos</h5>
                <ul className="space-y-4">
                  {mockTreatments.map(trat => (
                    <li key={trat.idTratamiento} className="flex gap-3 items-start">
                      <span className="material-symbols-outlined text-tertiary mt-0.5 text-[20px]">vaccines</span>
                      <div>
                        <p className="font-body text-sm font-bold text-on-surface">{trat.descripcion}</p>
                        <p className="font-body text-xs text-on-surface-variant mt-0.5">Emitido: {trat.fechaEmision} | Cons. ID: #{trat.idConsMedica}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* --- COLUMNA 3: HISTORIAL DE CONSULTAS (lg:col-span-4) --- */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 overflow-hidden flex flex-col h-full">
            <div className="bg-surface-container-lowest px-5 py-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h4 className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_hospital</span> Consultas Médicas
              </h4>
            </div>
            
            <div className="p-0 overflow-y-auto max-h-[600px] divide-y divide-outline-variant/20">
              {mockConsultations.map(cons => (
                <div key={cons.idConsMedica} className="p-5 hover:bg-surface-container-lowest/50 transition-colors border-l-4 border-transparent hover:border-primary cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div className="bg-primary-container/20 text-primary px-2 py-1 rounded-md text-center shrink-0 border border-primary/10">
                      <p className="font-display text-lg font-bold leading-none">{cons.fecha.split('-')[2]}</p>
                      <p className="font-body text-[10px] font-bold uppercase mt-1">{cons.fecha.split('-')[1]}-{cons.fecha.split('-')[0]}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-body text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">{cons.hora}</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-body text-sm font-bold text-on-surface mb-1">{cons.especialidad}</h5>
                    <p className="font-body text-xs text-on-surface-variant mb-2 line-clamp-2">{cons.diagnostico}</p>
                    <div className="flex items-center gap-4 text-[11px] text-on-surface-variant font-bold">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">stethoscope</span> Vet ID: #{cons.idVeterinario}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">meeting_room</span> {cons.hambiente}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ================= MODAL: NUEVA CONSULTA MÉDICA ================= */}
      <Modal isOpen={isConsultModalOpen} onClose={() => setIsConsultModalOpen(false)} title="Registrar Consulta Médica" maxWidth="max-w-3xl">
        <form onSubmit={handleConsultSubmit} className="space-y-6">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">info</span>
            <div>
              <p className="font-body text-sm font-bold text-on-surface">Paciente: {pet.nombre}</p>
              <p className="font-body text-xs text-on-surface-variant">Este registro se asociará automáticamente al ID de mascota #{pet.idMascota}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Fecha de Consulta:" icon="calendar_today" type="date" name="fecha" value={consultForm.fecha} onChange={handleInputChange} required />
            <InputField label="Hora:" icon="schedule" type="time" name="hora" value={consultForm.hora} onChange={handleInputChange} required />
            
            <div className="space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">Especialidad:</label>
              <select name="especialidad" value={consultForm.especialidad} onChange={handleInputChange} className="w-full pl-3 pr-10 py-3.5 border border-outline-variant rounded-lg font-body text-sm bg-white focus:border-primary focus:ring-1 outline-none">
                <option value="Medicina General">Medicina General</option>
                <option value="Cirugía">Cirugía</option>
                <option value="Dermatología">Dermatología</option>
                <option value="Traumatología">Traumatología</option>
              </select>
            </div>

            <InputField label="Ambiente / Consultorio:" icon="meeting_room" name="hambiente" value={consultForm.hambiente} onChange={handleInputChange} placeholder="Ej. Consultorio 1" required />
            <InputField label="Costo (Bs.):" icon="payments" type="number" step="0.01" name="costo" value={consultForm.costo} onChange={handleInputChange} required />
            
            {/* Foreign Keys según tu DB */}
            <InputField label="ID Veterinario (Atendió):" icon="badge" name="idVeterinario" value={consultForm.idVeterinario} onChange={handleInputChange} placeholder="ID del personal" required />
            <InputField label="ID Cita (Opcional):" icon="book_online" name="idCita" value={consultForm.idCita} onChange={handleInputChange} placeholder="ID de la reserva previa" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="outline" type="button" onClick={() => setIsConsultModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Guardar Consulta</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}