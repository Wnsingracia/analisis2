import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';

// ================= MOCK DATA (CITA) =================
const mockAppointments = [
  { idCita: '501', fecha: '2026-10-24', hora: '09:00', tipo: 'Consulta Médica', descripcion: 'Vacunación anual y revisión', costo: '150.00', idMascota: 'm1', idCliente: '201', idRecepcionista: '104' },
  { idCita: '502', fecha: '2026-10-24', hora: '11:30', tipo: 'Spa y Estética', descripcion: 'Corte de pelo y baño antipulgas', costo: '80.00', idMascota: 'm2', idCliente: '202', idRecepcionista: '104' },
];

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Mapeo EXACTO a la tabla CITA(idCita(PK),fecha,hora,tipo,descripcion,costo,idMascota(FK),idCliente(FK),idRecepcionista(FK))
  const emptyForm = {
    fecha: '', hora: '', tipo: 'Consulta Médica', descripcion: '', costo: '', idMascota: '', idCliente: '', 
    idRecepcionista: '104' // Simula el ID del empleado logueado
  };
  
  const [formData, setFormData] = useState<any>(emptyForm);

  const filteredAppointments = mockAppointments.filter(app => app.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) || app.tipo.toLowerCase().includes(searchTerm.toLowerCase()));

  // ================= HANDLERS =================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => { setFormData(emptyForm); setIsEditing(false); setIsFormModalOpen(true); };
  const openEditModal = (app: any) => { setFormData({ ...app }); setIsEditing(true); setIsFormModalOpen(true); };
  const openDeleteModal = (id: string) => { setSelectedAppointmentId(id); setIsDeleteModalOpen(true); };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando JSON CITA al Backend:", formData);
    setIsFormModalOpen(false);
  };

  const confirmDelete = () => {
    console.log(`Eliminando cita ID: ${selectedAppointmentId}`);
    setIsDeleteModalOpen(false);
    setSelectedAppointmentId(null);
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">Citas y Agenda</h2>
          <p className="font-body text-lg text-on-surface-variant">Gestiona las reservas de Spa y Consultas Médicas.</p>
        </div>
      </header>

      <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 flex flex-col flex-1 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[22px]">search</span>
            <input type="text" placeholder="Buscar por tipo o descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto flex-1 p-6">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b-2 border-outline-variant/30">
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Fecha y Hora</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Servicio</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ids Relacionales</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Costo Estimado</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredAppointments.map((app) => (
                <tr key={app.idCita} className="hover:bg-surface-container/30 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="font-body text-sm font-bold text-on-surface">{app.fecha}</p>
                    <p className="font-body text-xs font-bold text-primary mt-0.5">{app.hora}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-body text-[11px] font-bold border mb-1 ${app.tipo === 'Consulta Médica' ? 'bg-tertiary-container/30 text-tertiary border-tertiary/20' : 'bg-secondary-container/30 text-secondary border-secondary/20'}`}>
                      {app.tipo}
                    </span>
                    <p className="font-body text-xs text-on-surface-variant truncate max-w-[200px]">{app.descripcion}</p>
                  </td>
                  <td className="py-4 px-6 font-body text-xs text-on-surface-variant">
                    <p>Mascota: <span className="font-bold text-on-surface">#{app.idMascota}</span></p>
                    <p>Cliente: <span className="font-bold text-on-surface">#{app.idCliente}</span></p>
                  </td>
                  <td className="py-4 px-6 font-body text-sm font-bold text-on-surface">Bs. {app.costo}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(app)} className="w-8 h-8 rounded-lg flex items-center justify-center text-tertiary hover:bg-tertiary-container/50 transition-colors" title="Editar"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                      <button onClick={() => openDeleteModal(app.idCita)} className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/50 transition-colors" title="Cancelar Cita"><span className="material-symbols-outlined text-[20px]">event_busy</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL FORMULARIO CITA ================= */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={isEditing ? "Editar Cita" : "Agendar Nueva Cita"} maxWidth="max-w-3xl">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Fecha:" icon="calendar_today" type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required />
            <InputField label="Hora:" icon="schedule" type="time" name="hora" value={formData.hora} onChange={handleInputChange} required />
            
            <div className="space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">Tipo de Cita:</label>
              <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="w-full pl-3 pr-10 py-3.5 border border-primary rounded-lg font-body text-sm font-bold bg-white text-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="Consulta Médica">Consulta Médica</option>
                <option value="Spa y Estética">Spa y Estética</option>
                <option value="Vacunación">Vacunación</option>
                <option value="Control">Control de Rutina</option>
              </select>
            </div>

            <InputField label="Costo Estimado (Bs.):" icon="payments" type="number" step="0.01" name="costo" value={formData.costo} onChange={handleInputChange} required />

            {/* Llaves Foráneas (FK) */}
            <InputField label="ID Cliente (Dueño):" icon="person" name="idCliente" value={formData.idCliente} onChange={handleInputChange} placeholder="ID del sistema" required />
            <InputField label="ID Mascota (Paciente):" icon="pets" name="idMascota" value={formData.idMascota} onChange={handleInputChange} placeholder="ID del sistema" required />

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">Descripción / Motivo:</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows={3} placeholder="Detalles de los servicios requeridos..." className="w-full p-3 border border-outline-variant rounded-lg font-body text-sm text-on-surface bg-white focus:border-primary focus:ring-1 outline-none resize-none" required></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">{isEditing ? 'Actualizar Cita' : 'Confirmar Reserva'}</Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL ELIMINAR CITA ================= */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Cancelar Cita" maxWidth="max-w-[480px]">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-start gap-5 mb-6 mt-2">
            <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[28px] icon-fill">event_busy</span>
            </div>
            <div className="flex-1 text-left mt-1">
              <h4 className="font-display text-xl font-bold text-on-surface mb-2">¿Cancelar Cita?</h4>
              <p className="font-body text-[15px] text-on-surface-variant w-full leading-relaxed">
                El espacio en la agenda quedará libre inmediatamente. Esta acción es permanente.
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-end gap-3 w-full pt-5 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Atrás</Button>
            <Button variant="action" onClick={confirmDelete} className="bg-error border-error hover:bg-error/90 shadow-none px-6">Sí, Cancelar Cita</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}