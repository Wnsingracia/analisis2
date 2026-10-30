import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';
import api from '../../services/api'; // ◄ Instancia de Axios con interceptor JWT
import ClienteCombobox, { type ClienteOpcion } from '../../components/ui/ClienteComboBox.tsx'


interface CitaTratamiento {
  id_cita: string;
  fecha: string | null;
  hora: string | null;
  tipo: string | null;
  descripcion: string | null;
  costo: string | number | null;
  id_mascota: string | null;
  mascota_nombre?: string | null;
  id_cliente: string | null;
  id_recepcionista: string | null;
  // GET /citas no los devuelve (son datos clínicos); quedan opcionales para que la tabla compile
  id_tratamiento?: string | null;
  tratamiento_descripcion?: string | null;
  fecha_emision?: string | null;
}


interface Mascota {
  id_mascota: string;
  nombre: string;
  tipo?: string;
  raza?: string;
  id_cliente: string;
}

// Nest devuelve un array de mensajes cuando falla la validación
const mensaje = (error: any, porDefecto: string) => {
  const m = error.response?.data?.message;
  return Array.isArray(m) ? m.join('\n') : (m || porDefecto);
};
// Fuera del componente
const sinVacios = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ''));

// Contraseña temporal aleatoria de 12 caracteres, sin letras ambiguas (0/O, 1/l/I)
const generarClaveTemporal = () => {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('');
};

const nuevoClienteVacio = {
  nombres: '', ap_pat: '', ap_mat: '', cel: '', correo: '', contrasenia: '', direccion: '', nit: '',
  mascotaNombre: '', mascotaTipo: '', mascotaRaza: ''
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<CitaTratamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const [clientes, setClientes] = useState<ClienteOpcion[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);
  // Dentro del componente, junto a los demás useState
const [nuevoClienteAbierto, setNuevoClienteAbierto] = useState(false);
const [guardandoCliente, setGuardandoCliente] = useState(false);
const [nuevoCliente, setNuevoCliente] = useState(nuevoClienteVacio);

  const emptyForm = {
    fecha: '', hora: '', tipo: 'Consulta', descripcion: '',
    costo: '', idMascota: '', idCliente: ''
  };
  const [formData, setFormData] = useState<any>(emptyForm);

  // ================= CARGA DE DATOS =================
  const cargarCitas = async () => {
    setCargando(true);
    try {
      const res = await api.get('/citas/agenda');
      setAppointments(res.data);
    } catch (error: any) {
      console.error(error);
      alert(mensaje(error, 'No se pudo sincronizar la agenda de citas.'));
    } finally {
      setCargando(false);
    }
  };

  const cargarClientes = async () => {
    setCargandoClientes(true);
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (error: any) {
      console.error('Error cargando dueños:', error);
      alert(mensaje(error, 'No se pudo cargar la lista de dueños.'));
    } finally {
      setCargandoClientes(false);
    }
  };

  // Al elegir dueño: se limpia la mascota y se cargan solo las suyas
  const cargarMascotas = async (idCliente: string) => {
    setFormData((prev: any) => ({ ...prev, idCliente, idMascota: '' }));
    setMascotas([]);
    if (!idCliente) return;

    setCargandoMascotas(true);
    try {
      const res = await api.get('/mascotas', { params: { id_cliente: idCliente } });
      setMascotas(res.data);
    } catch (error: any) {
      console.error('Error cargando mascotas:', error);
      alert(mensaje(error, 'No se pudieron cargar las mascotas del dueño.'));
    } finally {
      setCargandoMascotas(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  // ================= FILTRADO =================
  const term = searchTerm.toLowerCase();
  const filteredAppointments = appointments.filter(app =>
    app.descripcion?.toLowerCase().includes(term) ||
    app.tipo?.toLowerCase().includes(term)
  );

  // ================= HANDLERS =================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    // Si el recepcionista ya había escrito algo en el buscador, se coloca en el campo que corresponda
  const abrirNuevoCliente = (texto: string) => {
    setNuevoCliente({
      ...nuevoClienteVacio,
      contrasenia: generarClaveTemporal(),
      correo: texto.includes('@') ? texto : '',
      cel: /^\d+$/.test(texto) ? texto : '',
      nombres: texto && !texto.includes('@') && !/^\d+$/.test(texto) ? texto : '',
    });
    setNuevoClienteAbierto(true);
  };

  const handleNuevoClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // El backend exige solo dígitos en celular y NIT
    const soloDigitos = name === 'cel' || name === 'nit';
    setNuevoCliente((prev) => ({ ...prev, [name]: soloDigitos ? value.replace(/\D/g, '') : value }));
  };

  const guardarNuevoCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guardandoCliente) return;
    setGuardandoCliente(true);

    // 1) Cliente (el backend crea usuario + cliente en una transacción)
    let idNuevo = '';
    try {
      const { data } = await api.post('/clientes', sinVacios({
        nombres: nuevoCliente.nombres.trim(),
        ap_pat: nuevoCliente.ap_pat.trim(),
        ap_mat: nuevoCliente.ap_mat.trim(),
        cel: nuevoCliente.cel,
        correo: nuevoCliente.correo.trim(),
        contrasenia: nuevoCliente.contrasenia,
        direccion: nuevoCliente.direccion.trim(),
        nit: nuevoCliente.nit,
      }));
      idNuevo = String(data.id_usuario);
    } catch (error: any) {
      alert(mensaje(error, 'No se pudo registrar al cliente.'));
      setGuardandoCliente(false);
      return;
    }

    // 2) Primera mascota: sin ella no se puede agendar la cita
    let idMascota = '';
    try {
      const { data } = await api.post('/mascotas', sinVacios({
        id_cliente: idNuevo,
        nombre: nuevoCliente.mascotaNombre.trim(),
        tipo: nuevoCliente.mascotaTipo.trim(),
        raza: nuevoCliente.mascotaRaza.trim(),
      }));
      idMascota = String(data.id_mascota);
    } catch (error: any) {
      alert(`Cliente registrado, pero no se pudo guardar la mascota:\n${mensaje(error, 'Error desconocido.')}`);
    }

    // 3) Refresca la lista y deja seleccionados al cliente y a su mascota
    try {
      await cargarClientes();
      await cargarMascotas(idNuevo);
      if (idMascota) setFormData((prev: any) => ({ ...prev, idMascota }));
    } finally {
      setNuevoClienteAbierto(false);
      setGuardandoCliente(false);
    }

    alert(
      `Cliente registrado.\nContraseña temporal: ${nuevoCliente.contrasenia}\n` +
      'Entrégasela al cliente; no se vuelve a mostrar.'
    );
  };

  const openCreateModal = async () => {
    setFormData(emptyForm);
    setMascotas([]);
    setSelectedAppointmentId(null);
    setIsEditing(false);
    await cargarClientes();
    setIsFormModalOpen(true);
  };

  const openEditModal = async (app: CitaTratamiento) => {
    setSelectedAppointmentId(app.id_cita);
    setIsEditing(true);
    setFormData({
      fecha: app.fecha ?? '',
      hora: app.hora ?? '',
      tipo: app.tipo ?? 'Consulta',
      descripcion: app.descripcion ?? '',
      costo: app.costo != null ? String(app.costo) : '',
      idMascota: app.id_mascota ?? '',
      idCliente: app.id_cliente ?? ''
    });
    setMascotas([]);
    setIsFormModalOpen(true);

    try {
      await cargarClientes();
      if (app.id_cliente) {
        const res = await api.get('/mascotas', { params: { id_cliente: app.id_cliente } });
        setMascotas(res.data);
      }
    } catch (error: any) {
      console.error('Error cargando los datos de la cita:', error);
      alert(mensaje(error, 'No se pudieron cargar los dueños o las mascotas.'));
    }
  };

  const openDeleteModal = (id: string) => {
    setSelectedAppointmentId(id);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.idCliente || !formData.idMascota) {
      alert('Selecciona un dueño y una mascota.');
      return;
    }

    const datosCita = {
      fecha: formData.fecha,
      hora: formData.hora,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      costo: Number(formData.costo),
      id_cliente: formData.idCliente,   // string, sin Number()
      id_mascota: formData.idMascota,   // string, sin Number()
    };

    try {
      if (isEditing && selectedAppointmentId !== null) {
        await api.put(`/citas/${selectedAppointmentId}`, datosCita);
        alert('Cita reprogramada con éxito.');
      } else {
        await api.post('/citas', datosCita);
        alert('Nueva cita reservada en la agenda.');
      }
      setIsFormModalOpen(false);
      await cargarCitas();
    } catch (error: any) {
      alert(mensaje(error, 'Error al procesar la cita.'));
    }
  };

  const confirmDelete = async () => {
    if (!selectedAppointmentId) return;
    try {
      await api.delete(`/citas/${selectedAppointmentId}`);
      alert('Cita cancelada.');
      setIsDeleteModalOpen(false);
      setSelectedAppointmentId(null);
      await cargarCitas();
    } catch (error: any) {
      alert(mensaje(error, 'No se pudo remover la cita.'));
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
                        <p className="font-body text-xs font-bold text-on-surface leading-relaxed">{app.descripcion}</p>
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
                        <p className="mb-1">Paciente:{' '}<span className="font-bold text-primary">{app.mascota_nombre || `#${app.id_mascota}`}</span></p>
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

            <InputField label="Costo Estimado (Bs.):" icon="payments" type="number" step="1" name="costo" value={formData.costo} onChange={handleInputChange} required />
            <div className="space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">Dueño de la mascota:</label>
              <ClienteCombobox
                clientes={clientes}
                value={formData.idCliente}
                onChange={cargarMascotas}
                onNuevoCliente={abrirNuevoCliente}
                cargando={cargandoClientes}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">
                Mascota:
              </label>

              <select
                name="idMascota"
                value={formData.idMascota}
                onChange={handleInputChange}
                required
                disabled={!formData.idCliente || cargandoMascotas}
                className="w-full p-3.5 border border-outline-variant rounded-lg bg-white text-sm focus:border-primary outline-none disabled:bg-gray-100"
              >
                <option value="">
                  {!formData.idCliente
                    ? 'Primero selecciona un dueño'
                    : cargandoMascotas
                      ? 'Cargando mascotas...'
                      : mascotas.length === 0
                        ? 'Este dueño no tiene mascotas registradas'
                        : 'Selecciona una mascota'}
                </option>

                {mascotas.map((mascota) => (
                  <option
                    key={mascota.id_mascota}
                    value={mascota.id_mascota}
                  >
                    {mascota.nombre}
                    {mascota.tipo ? ` - ${mascota.tipo}` : ''}
                    {' '}
                  </option>
                ))}
              </select>
            </div>

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

      <Modal isOpen={nuevoClienteAbierto} onClose={() => setNuevoClienteAbierto(false)} title="Registrar nuevo cliente" maxWidth="max-w-3xl">
        <form onSubmit={guardarNuevoCliente} className="space-y-6">
          <div>
            <h4 className="font-display text-lg font-bold text-primary mb-3 border-b border-outline-variant/30 pb-2">1. Datos del dueño</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nombres:" icon="person" name="nombres" value={nuevoCliente.nombres} onChange={handleNuevoClienteChange} required />
              <InputField label="Apellido paterno:" icon="badge" name="ap_pat" value={nuevoCliente.ap_pat} onChange={handleNuevoClienteChange} required />
              <InputField label="Apellido materno:" icon="badge" name="ap_mat" value={nuevoCliente.ap_mat} onChange={handleNuevoClienteChange} />
              <InputField label="Celular:" icon="phone" name="cel" value={nuevoCliente.cel} onChange={handleNuevoClienteChange} />
              <InputField label="Correo:" icon="mail" type="email" name="correo" value={nuevoCliente.correo} onChange={handleNuevoClienteChange} required />
              <InputField label="NIT / CI:" icon="receipt_long" name="nit" value={nuevoCliente.nit} onChange={handleNuevoClienteChange} />
              <div className="md:col-span-2">
                <InputField label="Dirección:" icon="home" name="direccion" value={nuevoCliente.direccion} onChange={handleNuevoClienteChange} />
              </div>
              <div className="md:col-span-2 flex items-end gap-3">
                <div className="flex-1">
                  <InputField label="Contraseña temporal:" icon="key" name="contrasenia" value={nuevoCliente.contrasenia} onChange={handleNuevoClienteChange} required />
                </div>
                <Button variant="outline" type="button" onClick={() => setNuevoCliente((p) => ({ ...p, contrasenia: generarClaveTemporal() }))}>
                  Regenerar
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold text-primary mb-3 border-b border-outline-variant/30 pb-2">2. Primera mascota</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Nombre:" icon="pets" name="mascotaNombre" value={nuevoCliente.mascotaNombre} onChange={handleNuevoClienteChange} required />
              <InputField label="Tipo:" icon="category" name="mascotaTipo" value={nuevoCliente.mascotaTipo} onChange={handleNuevoClienteChange} placeholder="Perro, Gato..." required />
              <InputField label="Raza:" icon="label" name="mascotaRaza" value={nuevoCliente.mascotaRaza} onChange={handleNuevoClienteChange} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="outline" type="button" onClick={() => setNuevoClienteAbierto(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">{guardandoCliente ? 'Guardando...' : 'Registrar y seleccionar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}