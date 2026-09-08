import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';
import api from '../../services/api'; // ◄ Instancia de Axios con interceptor JWT

interface CitaTratamiento {
  id_cita: number;
  fecha: string;
  hora: string;
  tipo: string;
  cita_descripcion: string;
  costo: number;
  id_mascota: number;
  id_cliente: number;
  id_recepcionista: number;
  id_tratamiento?: number;
  tratamiento_descripcion?: string;
  fecha_emision?: string;
}

export default function Appointments() {
  // ================= ESTADOS REALES =================
  const [appointments, setAppointments] = useState<CitaTratamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

  const emptyForm = {
    fecha: '', hora: '', tipo: 'Consulta Médica', descripcion: '', costo: '', idMascota: '', idCliente: '', 
    idRecepcionista: '700018' // ID de prueba basado en tus inserts
  };
  
  const [formData, setFormData] = useState<any>(emptyForm);

  // ================= SYNC CON POSTGRES =================
  const cargarCitas = async () => {
    setCargando(true);
    try {
      const res = await api.get('/usuarios/con-tratamientos');
      setAppointments(res.data);
    } catch (error) {
      console.error(error);
      alert("No se pudo sincronizar la agenda de citas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  // ================= FILTRADO REAL =================
  const filteredAppointments = appointments.filter(app => 
    app.cita_descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.tratamiento_descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= HANDLERS =================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => { setFormData(emptyForm); setIsEditing(false); setIsFormModalOpen(true); };
  
  const openEditModal = (app: CitaTratamiento) => { 
    setFormData({ 
      fecha: app.fecha,
      hora: app.hora,
      tipo: app.tipo,
      descripcion: app.cita_descripcion,
      costo: app.costo.toString(),
      idMascota: app.id_mascota.toString(),
      idCliente: app.id_cliente.toString(),
      idRecepcionista: app.id_recepcionista.toString()
    }); 
    setSelectedAppointmentId(app.id_cita);
    setIsEditing(true); 
    setIsFormModalOpen(true); 
  };
  
  const openDeleteModal = (id: number) => { setSelectedAppointmentId(id); setIsDeleteModalOpen(true); };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/usuarios/${selectedAppointmentId}`, formData);
        alert("Cita reprogramada con éxito.");
      } else {
        await api.post('/usuarios', formData);
        alert("Nueva cita reservada en la agenda.");
      }
      setIsFormModalOpen(false);
      cargarCitas();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al procesar la cita.");
    }
  };

  const confirmDelete = async () => {
    if (!selectedAppointmentId) return;
    try {
      await api.delete(`/usuarios/${selectedAppointmentId}`);
      alert("Cita cancelada y removida de la base de datos.");
      setIsDeleteModalOpen(false);
      setSelectedAppointmentId(null);
      cargarCitas();
    } catch (error: any) {
      alert(error.response?.data?.message || "No se pudo remover la cita.");
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">Citas y Agenda</h2>
          <p className="font-body text-lg text-on-surface-variant">Gestiona las reservas de Spa, Consultas y sus tratamientos expedidos.</p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl shadow-ambient">
          <span className="material-symbols-outlined font-bold text-[20px]">add</span>
          NUEVA CITA
        </Button>
      </header>

      <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 flex flex-col flex-1 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[22px]">search</span>
            <input type="text" placeholder="Buscar por tipo, motivo o tratamiento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto flex-1 p-6">
          {cargando ? (
            <div className="p-12 text-center font-body text-sm text-on-surface-variant animate-pulse">
              Consultando la agenda unificada en Postgres...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-low/50 border-b-2 border-outline-variant/30">
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider w-36">Fecha y Hora</th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Detalles del Servicio</th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tratamiento Clínico</th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider w-36">Vínculos</th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider w-28">Costo</th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((app) => (
                    <tr key={app.id_cita} className="hover:bg-surface-container/30 transition-colors group align-top">
                      <td className="py-4 px-6">
                        <p className="font-body text-sm font-bold text-on-surface">{app.fecha}</p>
                        <p className="font-body text-xs font-bold text-primary mt-0.5">{app.hora}</p>
                        <p className="font-body text-[10px] text-outline mt-2">ID Cita: #{app.id_cita}</p>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-body text-[11px] font-bold border mb-1.5 
                          ${app.tipo === 'Consulta' || app.tipo === 'Consulta Médica' ? 'bg-tertiary-container/30 text-tertiary border-tertiary/20' : 
                            app.tipo === 'Cirugía' || app.tipo === 'Urgencia' ? 'bg-error-container/30 text-error border-error/20' :
                            'bg-secondary-container/30 text-secondary border-secondary/20'}`}>
                          {app.tipo}
                        </span>
                        <p className="font-body text-xs font-bold text-on-surface leading-relaxed">{app.cita_descripcion}</p>
                      </td>
                      
                      {/* 🐾 RENDERIZADO DEL TRATAMIENTO OBTENIDO VÍA LEFT JOIN */}
                      <td className="py-4 px-6 max-w-sm">
                        {app.id_tratamiento ? (
                          <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 text-primary mb-1">
                              <span className="material-symbols-outlined text-[16px] icon-fill">prescriptions</span>
                              <span className="font-body text-[11px] font-bold uppercase tracking-wider">Tratamiento Emitido</span>
                            </div>
                            <p className="font-body text-xs text-on-surface leading-relaxed">{app.tratamiento_descripcion}</p>
                            <p className="font-body text-[10px] text-outline mt-1.5">Emisión: {app.fecha_emision}</p>
                          </div>
                        ) : (
                          <p className="font-body text-xs text-outline/70 italic mt-2">Sin prescripción médica o servicio de estética.</p>
                        )}
                      </td>

                      <td className="py-4 px-6 font-body text-xs text-on-surface-variant">
                        <p className="mb-1">Paciente: <span className="font-bold text-primary">#{app.id_mascota}</span></p>
                        <p className="mb-1">Dueño: <span className="font-bold text-on-surface">#{app.id_cliente}</span></p>
                        <p>Atendió: <span className="font-bold text-outline">#{app.id_recepcionista}</span></p>
                      </td>
                      <td className="py-4 px-6 font-body text-sm font-bold text-on-surface">Bs. {app.costo}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(app)} className="w-8 h-8 rounded-lg flex items-center justify-center text-tertiary hover:bg-tertiary-container/50 transition-colors" title="Editar"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                          <button onClick={() => openDeleteModal(app.id_cita)} className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/50 transition-colors" title="Cancelar Cita"><span className="material-symbols-outlined text-[20px]">event_busy</span></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant font-body italic">
                      No se registraron citas correspondientes con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
                <option value="Consulta">Consulta Médica</option>
                <option value="Cirugía">Cirugía Quirúrgica</option>
                <option value="Urgencia">Urgencia Médica</option>
                <option value="Estética">Spa y Estética</option>
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