import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SideNavBar } from './SideNavBar';
import { AdminTopBar } from './AdminTopBar';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';

export const AdminLayout: React.FC = () => {
  // Estado para controlar el Modal desde cualquier parte del sistema
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    fecha: '', hora: '', tipo: 'Consulta Médica', descripcion: '', costo: '', idMascota: '', idCliente: '', idRecepcionista: '104'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Cita Global creada y enviada al Backend:", formData);
    setIsGlobalModalOpen(false);
    // Aquí el backend procesará la petición y puedes reiniciar el form
  };

  return (
    <div className="bg-background text-on-surface font-body antialiased overflow-hidden flex h-screen w-full relative">
      
      {/* Pasamos la función al Navbar para que el botón naranja funcione */}
      <SideNavBar onOpenGlobalAppointment={() => setIsGlobalModalOpen(true)} />

      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        <AdminTopBar />
        <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-surface">
          <Outlet />
        </div>
      </div>

      {/* ================= MODAL GLOBAL DE CITAS ================= */}
      {/* Al estar en el Layout, este modal flota por encima de TODAS las pestañas */}
      <Modal isOpen={isGlobalModalOpen} onClose={() => setIsGlobalModalOpen(false)} title="Agendar Nueva Cita" maxWidth="max-w-3xl">
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
            <InputField label="ID Cliente (Dueño):" icon="person" name="idCliente" value={formData.idCliente} onChange={handleInputChange} placeholder="ID del sistema" required />
            <InputField label="ID Mascota (Paciente):" icon="pets" name="idMascota" value={formData.idMascota} onChange={handleInputChange} placeholder="ID del sistema" required />

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">Descripción / Motivo:</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows={3} placeholder="Detalles de los servicios requeridos..." className="w-full p-3 border border-outline-variant rounded-lg font-body text-sm text-on-surface bg-white focus:border-primary focus:ring-1 outline-none resize-none" required></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="outline" type="button" onClick={() => setIsGlobalModalOpen(false)}>Cancelar</Button>
            <Button variant="action" type="submit" className="bg-secondary-container border-secondary hover:bg-secondary shadow-none">Confirmar Reserva</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};