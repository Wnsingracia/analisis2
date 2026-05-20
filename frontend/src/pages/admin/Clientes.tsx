import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';

// ================= MOCK DATA =================
const initialClients = [
  { idUsuario: '201', nombres: 'Carlos', apPat: 'Mendoza', apMat: '', cel: '71234567', correo: 'carlos.m@mail.com', direccion: 'Av. Siempre Viva 123', nit: '123456701', estado: 'Activo' },
  { idUsuario: '202', nombres: 'Lucía', apPat: 'Fernández', apMat: 'Rojas', cel: '79876543', correo: 'lucia.f@mail.com', direccion: 'Calle Las Flores 45', nit: '987654301', estado: 'Inactivo' },
];

const initialPets = [
  { idMascota: 'm1', idCliente: '201', nombre: 'Rex', tipo: 'Perro', raza: 'Terrier Mix', edad: '3 años', peso: '5 kg', altura: '30 cm', alergias: 'Ninguna', genero: 'M' },
  { idMascota: 'm2', idCliente: '201', nombre: 'Luna', tipo: 'Gato', raza: 'Siamés', edad: '2 años', peso: '3.5 kg', altura: '25 cm', alergias: 'Polvo', genero: 'H' },
];

export default function Clients() {
  // ================= ESTADOS =================
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Estados de Modales de Cliente
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Estados de Modales de Mascota
  const [isPetManagerOpen, setIsPetManagerOpen] = useState(false);
  const [isPetFormModalOpen, setIsPetFormModalOpen] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);

  // Formularios
  const emptyClientForm = { nombres: '', apPat: '', apMat: '', cel: '', correo: '', genero: '', contrasenia: '12345678', direccion: '', nit: '', estado: 'Activo' };
  const emptyPetForm = { nombre: '', tipo: '', raza: '', edad: '', peso: '', altura: '', alergias: '', genero: '' };
  
  const [clientForm, setClientForm] = useState(emptyClientForm);
  const [petForm, setPetForm] = useState(emptyPetForm);

  // ================= FILTROS =================
  const filteredClients = initialClients.filter(client => {
    const matchesSearch = `${client.nombres} ${client.apPat}`.toLowerCase().includes(searchTerm.toLowerCase()) || client.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || client.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getClientPets = (clientId: string) => initialPets.filter(pet => pet.idCliente === clientId);

  // ================= HANDLERS CLIENTE =================
  const openCreateClient = () => { setClientForm(emptyClientForm); setIsEditingClient(false); setIsClientModalOpen(true); };
  
  const openEditClient = (client: any) => { setClientForm({ ...emptyClientForm, ...client }); setIsEditingClient(true); setIsClientModalOpen(true); };
  
  const openStatusToggle = (client: any) => { setSelectedClient(client); setIsStatusModalOpen(true); };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando Cliente al Backend:", clientForm);
    setIsClientModalOpen(false);
  };

  const confirmStatusToggle = () => {
    const nuevoEstado = selectedClient.estado === 'Activo' ? 'Inactivo' : 'Activo';
    console.log(`Cambiando estado del cliente ${selectedClient.idUsuario} a: ${nuevoEstado}`);
    // axios.patch(`/api/clientes/${selectedClient.idUsuario}/estado`, { estado: nuevoEstado })
    setIsStatusModalOpen(false);
  };

  // ================= HANDLERS MASCOTA =================
  const openPetManager = (client: any) => { setSelectedClient(client); setIsPetManagerOpen(true); };

  const openCreatePet = () => { setPetForm(emptyPetForm); setIsEditingPet(false); setIsPetFormModalOpen(true); };

  const openEditPet = (pet: any) => { setPetForm({ ...emptyPetForm, ...pet }); setIsEditingPet(true); setIsPetFormModalOpen(true); };

  const handlePetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Enviando Mascota para el cliente ${selectedClient.idUsuario}:`, petForm);
    setIsPetFormModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* CABECERA */}
      <header className="pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">Clientes y Mascotas</h2>
          <p className="font-body text-lg text-on-surface-variant">Gestiona dueños, sus mascotas y estados de cuenta.</p>
        </div>
        <Button variant="primary" onClick={openCreateClient} className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl shadow-ambient">
          <span className="material-symbols-outlined font-bold text-[20px]">person_add</span>
          NUEVO CLIENTE
        </Button>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 flex flex-col flex-1 overflow-hidden">
        
        {/* FILTROS */}
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary text-[22px]">search</span>
            <input type="text" placeholder="Buscar por nombre o correo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline/70" />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="font-body text-sm font-bold text-on-surface-variant whitespace-nowrap">Estado:</label>
            <div className="relative w-full md:w-40">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm font-bold pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer">
                <option value="Todos">Todos</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* TABLA CLIENTES */}
        <div className="overflow-x-auto flex-1 p-6">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b-2 border-outline-variant/30">
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cliente</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contacto</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mascotas</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredClients.map((client) => {
                const pets = getClientPets(client.idUsuario);
                return (
                  <tr key={client.idUsuario} className={`hover:bg-surface-container/30 transition-colors ${client.estado === 'Inactivo' ? 'opacity-60 bg-surface-container-lowest' : ''}`}>
                    <td className="py-4 px-6">
                      <p className="font-body text-sm font-bold text-on-surface">{client.nombres} {client.apPat}</p>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">ID: #{client.idUsuario}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-body text-sm text-on-surface">{client.correo}</p>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">{client.cel}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-2">
                        {pets.length > 0 ? pets.map(pet => (
                          <span key={pet.idMascota} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-tertiary-container/20 text-tertiary font-body text-[11px] font-bold border border-tertiary/20">
                            <span className="material-symbols-outlined text-[14px]">pets</span> {pet.nombre}
                          </span>
                        )) : <span className="text-xs text-outline italic">Sin mascotas</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs font-bold ${client.estado === 'Activo' ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20' : 'bg-outline-variant/20 text-on-surface-variant border border-outline-variant/40'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${client.estado === 'Activo' ? 'bg-[#4CAF50]' : 'bg-outline-variant'}`}></span>
                        {client.estado}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón Mascotas */}
                        <button onClick={() => openPetManager(client)} className="w-9 h-9 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary-container/30 transition-colors" title="Gestionar Mascotas">
                          <span className="material-symbols-outlined text-[20px]">sound_detection_dog_barking</span>
                        </button>
                        {/* Botón Editar */}
                        <button onClick={() => openEditClient(client)} className="w-9 h-9 rounded-lg flex items-center justify-center text-tertiary hover:bg-tertiary-container/30 transition-colors" title="Editar Cliente">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        {/* Botón Activar/Desactivar */}
                        <button onClick={() => openStatusToggle(client)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${client.estado === 'Activo' ? 'text-error hover:bg-error-container/50' : 'text-[#4CAF50] hover:bg-[#4CAF50]/20'}`} title={client.estado === 'Activo' ? "Desactivar" : "Activar"}>
                          <span className="material-symbols-outlined text-[20px]">{client.estado === 'Activo' ? 'block' : 'check_circle'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL CLIENTE ================= */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title={isEditingClient ? "Editar Cliente" : "Nuevo Cliente"} maxWidth="max-w-4xl">
        <form onSubmit={handleClientSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Nombres:" icon="person" name="nombres" value={clientForm.nombres} onChange={(e) => setClientForm({...clientForm, nombres: e.target.value})} required />
            <InputField label="Apellido Paterno:" icon="person" name="apPat" value={clientForm.apPat} onChange={(e) => setClientForm({...clientForm, apPat: e.target.value})} required />
            <InputField label="Apellido Materno:" icon="person" name="apMat" value={clientForm.apMat} onChange={(e) => setClientForm({...clientForm, apMat: e.target.value})} />
            <InputField label="Celular:" icon="call" name="cel" value={clientForm.cel} onChange={(e) => setClientForm({...clientForm, cel: e.target.value})} required />
            <InputField label="Correo Electrónico:" icon="mail" type="email" name="correo" value={clientForm.correo} onChange={(e) => setClientForm({...clientForm, correo: e.target.value})} required />
            <InputField label="Dirección:" icon="location_on" name="direccion" value={clientForm.direccion} onChange={(e) => setClientForm({...clientForm, direccion: e.target.value})} required />
            <InputField label="NIT / CI (Facturación):" icon="receipt_long" name="nit" value={clientForm.nit} onChange={(e) => setClientForm({...clientForm, nit: e.target.value})} required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="outline" type="button" onClick={() => setIsClientModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">{isEditingClient ? 'Guardar Cambios' : 'Registrar Cliente'}</Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL GESTIÓN DE MASCOTAS ================= */}
      <Modal isOpen={isPetManagerOpen} onClose={() => setIsPetManagerOpen(false)} title={selectedClient ? `Mascotas de: ${selectedClient.nombres}` : "Mascotas"} maxWidth="max-w-4xl">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
            <p className="font-body text-sm text-on-surface-variant">Administra el perfil clínico de los pacientes asociados a este cliente.</p>
            <Button variant="secondary" onClick={openCreatePet} className="py-2 px-4 text-sm">
              <span className="material-symbols-outlined text-[18px]">add</span> Agregar Mascota
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedClient && getClientPets(selectedClient.idUsuario).map(pet => (
              <div key={pet.idMascota} className="bg-white border border-outline-variant/30 p-4 rounded-2xl shadow-sm flex flex-col relative group">
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditPet(pet)} className="p-1.5 bg-tertiary-container/30 text-tertiary rounded-md hover:bg-tertiary-container/50"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center text-primary shrink-0"><span className="material-symbols-outlined text-2xl">cruelty_free</span></div>
                  <div>
                    <h5 className="font-display text-lg font-bold text-on-surface">{pet.nombre}</h5>
                    <p className="font-body text-xs text-on-surface-variant">{pet.tipo} • {pet.raza}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-body text-on-surface-variant bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20">
                  <p><strong>Edad:</strong> {pet.edad}</p>
                  <p><strong>Peso:</strong> {pet.peso}</p>
                  <p className="col-span-2 text-error"><strong>Alergias:</strong> {pet.alergias}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* ================= MODAL FORMULARIO MASCOTA ================= */}
      <Modal isOpen={isPetFormModalOpen} onClose={() => setIsPetFormModalOpen(false)} title={isEditingPet ? "Editar Mascota" : "Registrar Nueva Mascota"} maxWidth="max-w-2xl">
        <form onSubmit={handlePetSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Nombre de Mascota:" icon="sound_detection_dog_barking" name="nombre" value={petForm.nombre} onChange={(e) => setPetForm({...petForm, nombre: e.target.value})} required />
            <div className="space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">Especie / Tipo:</label>
              <select name="tipo" value={petForm.tipo} onChange={(e) => setPetForm({...petForm, tipo: e.target.value})} className="w-full pl-3 pr-10 py-3.5 border border-outline-variant rounded-lg font-body text-sm bg-white focus:border-primary focus:ring-1 outline-none">
                <option value="">Seleccionar...</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Exótico">Exótico</option>
              </select>
            </div>
            <InputField label="Raza:" icon="category" name="raza" value={petForm.raza} onChange={(e) => setPetForm({...petForm, raza: e.target.value})} required />
            <InputField label="Edad (Ej. 2 años):" icon="calendar_month" name="edad" value={petForm.edad} onChange={(e) => setPetForm({...petForm, edad: e.target.value})} required />
            <InputField label="Peso (Kg):" icon="scale" name="peso" value={petForm.peso} onChange={(e) => setPetForm({...petForm, peso: e.target.value})} />
            <InputField label="Altura (cm):" icon="height" name="altura" value={petForm.altura} onChange={(e) => setPetForm({...petForm, altura: e.target.value})} />
            <div className="md:col-span-2">
              <InputField label="Alergias Conocidas:" icon="medical_information" name="alergias" placeholder="Escribir 'Ninguna' si no aplica" value={petForm.alergias} onChange={(e) => setPetForm({...petForm, alergias: e.target.value})} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="outline" type="button" onClick={() => setIsPetFormModalOpen(false)}>Cancelar</Button>
            <Button variant="secondary" type="submit">{isEditingPet ? 'Actualizar Mascota' : 'Guardar Mascota'}</Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL DESACTIVAR / ACTIVAR (SOFT DELETE) ================= */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Cambiar Estado de Cuenta" maxWidth="max-w-[480px]">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-start gap-5 mb-6 mt-2">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-inner ${selectedClient?.estado === 'Activo' ? 'bg-error-container text-error' : 'bg-[#4CAF50]/20 text-[#4CAF50]'}`}>
              <span className="material-symbols-outlined text-[28px] icon-fill">
                {selectedClient?.estado === 'Activo' ? 'block' : 'check_circle'}
              </span>
            </div>
            <div className="flex-1 text-left mt-1">
              <h4 className="font-display text-xl font-bold text-on-surface mb-2">
                ¿{selectedClient?.estado === 'Activo' ? 'Desactivar' : 'Reactivar'} Cliente?
              </h4>
              <p className="font-body text-[15px] text-on-surface-variant w-full leading-relaxed">
                {selectedClient?.estado === 'Activo' 
                  ? 'El usuario ya no podrá acceder al sistema, pero sus historiales clínicos y facturas permanecerán intactos en la base de datos.' 
                  : 'El usuario recuperará su acceso al sistema y podrá agendar nuevas citas.'}
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-end gap-3 w-full pt-5 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>Cancelar</Button>
            <Button 
                variant="action" 
                onClick={confirmStatusToggle} // <-- Se le quitó la palabra "Delete"
                className={`shadow-none px-6 ${selectedClient?.estado === 'Activo' ? 'bg-error border-error hover:bg-error/90' : 'bg-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50]/90'}`}
                >
                Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}