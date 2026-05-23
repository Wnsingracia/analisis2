import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';

// ================= MOCK DATA =================
const initialClients = [
  { idUsuario: '201', nombres: 'Carlos', apPat: 'Mendoza', apMat: '', cel: '71234567', correo: 'carlos.m@mail.com', direccion: 'Av. Siempre Viva 123', nit: '123456701', estado: 'Activo', ultimaCita: { fecha: '2026-10-15', mascota: 'Yacarin', servicio: 'Control General' } },
  { idUsuario: '202', nombres: 'Lucía', apPat: 'Fernández', apMat: 'Rojas', cel: '79876543', correo: 'lucia.f@mail.com', direccion: 'Calle Las Flores 45', nit: '987654301', estado: 'Inactivo', ultimaCita: { fecha: '2026-08-02', mascota: 'Luna', servicio: 'Spa y Estética' } },
];

const initialPets = [
  { idMascota: 'm1', idCliente: '201', nombre: 'Rex', tipo: 'Perro', raza: 'Pastor Aleman', edad: '3 años', peso: '10 kg', altura: '100 cm', alergias: 'Ninguna', genero: 'M' },
  { idMascota: 'm2', idCliente: '202', nombre: 'Luna', tipo: 'Gato', raza: 'Siamés', edad: '2 años', peso: '3.5 kg', altura: '25 cm', alergias: 'Polvo', genero: 'H' },
];

export default function Clients() {
  const location = useLocation();
  const navigate = useNavigate();

  // ================= ESTADOS =================
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Estados de Modales de Cliente
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Estados de Modales de Mascota
  const [isPetManagerOpen, setIsPetManagerOpen] = useState(false);
  const [isPetFormModalOpen, setIsPetFormModalOpen] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(false);

  // Formularios
  const emptyClientForm = { nombres: '', apPat: '', apMat: '', cel: '', correo: '', genero: '', contrasenia: '12345678', direccion: '', nit: '', estado: 'Activo' };
  const emptyPetForm = { nombre: '', tipo: '', raza: '', edad: '', peso: '', altura: '', alergias: '', genero: '' };
  
  const [clientForm, setClientForm] = useState(emptyClientForm);
  const [petForm, setPetForm] = useState(emptyPetForm);

  // ================= LÓGICA DE BÚSQUEDA AUTOMÁTICA DESDE TOPBAR =================
  useEffect(() => {
    if (location.state?.searchName) {
      setSearchTerm(location.state.searchName);
    }
  }, [location.state]);

  // ================= LÓGICA DE FILTRADO =================
  const getClientPets = (clientId: string) => initialPets.filter(pet => pet.idCliente === clientId);

  const filteredClients = initialClients.filter(client => {
    const pets = getClientPets(client.idUsuario);
    const hasPetMatch = pets.some(pet => pet.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSearch = 
      `${client.nombres} ${client.apPat}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hasPetMatch;

    const matchesStatus = statusFilter === 'Todos' || client.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ================= HANDLERS CLIENTE =================
  const openCreateClient = () => { setClientForm(emptyClientForm); setIsEditingClient(false); setIsClientModalOpen(true); };
  const openEditClient = (client: any) => { setClientForm({ ...emptyClientForm, ...client }); setIsEditingClient(true); setIsClientModalOpen(true); };
  const openDeleteClient = (client: any) => { setSelectedClient(client); setIsDeleteClientModalOpen(true); };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando Cliente al Backend:", clientForm);
    setIsClientModalOpen(false);
  };

  const confirmDeleteClient = () => {
    console.log(`Eliminando permanentemente al cliente ID: ${selectedClient?.idUsuario}`);
    setIsDeleteClientModalOpen(false);
  };

  // ================= HANDLERS MASCOTA =================
  const openPetManager = (client: any) => { setSelectedClient(client); setIsPetManagerOpen(true); };
  const openCreatePet = () => { setPetForm(emptyPetForm); setIsEditingPet(false); setIsPetFormModalOpen(true); };
  const openEditPet = (pet: any) => { setPetForm({ ...emptyPetForm, ...pet }); setIsEditingPet(true); setIsPetFormModalOpen(true); };

  const handlePetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Guardando Mascota para el cliente ${selectedClient?.idUsuario}:`, petForm);
    setIsPetFormModalOpen(false);
  };

  const navigateToClinicalHistory = (petId: string) => {
    setIsPetManagerOpen(false); // Cierra el modal antes de navegar
    navigate(`/admin/clinical-history/${petId}`);
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* ================= CABECERA ================= */}
      <header className="pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">Clientes y Mascotas</h2>
          <p className="font-body text-lg text-on-surface-variant">Gestiona dueños, sus perfiles y el acceso rápido al historial clínico.</p>
        </div>
        <Button variant="primary" onClick={openCreateClient} className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl shadow-ambient">
          <span className="material-symbols-outlined font-bold text-[20px]">person_add</span>
          NUEVO CLIENTE
        </Button>
      </header>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 flex flex-col flex-1 overflow-hidden">
        
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary text-[22px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar dueño, correo o nombre de mascota..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline/70" 
            />
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

        {/* ================= TABLA MEJORADA ================= */}
        <div className="overflow-x-auto flex-1 p-6">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b-2 border-outline-variant/30">
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cliente y Contacto</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Actividad / Mascotas</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const pets = getClientPets(client.idUsuario);
                  
                  const matchedPet = searchTerm ? pets.find(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase())) : null;

                  return (
                    <tr key={client.idUsuario} className={`hover:bg-surface-container/30 transition-colors ${client.estado === 'Inactivo' ? 'opacity-60 bg-surface-container-lowest' : ''}`}>
                      
                      <td className="py-4 px-6">
                        <p className="font-body text-sm font-bold text-on-surface">{client.nombres} {client.apPat}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-body text-[11px] font-bold text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-md">ID: #{client.idUsuario}</span>
                          <span className="font-body text-xs text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">call</span> {client.cel}</span>
                        </div>
                        <p className="font-body text-xs text-on-surface-variant mt-0.5">{client.correo}</p>
                      </td>

                      <td className="py-4 px-6">
                        {matchedPet ? (
                          <div className="bg-primary-container/10 border border-primary/20 p-2 rounded-lg inline-block">
                            <p className="font-body text-xs font-bold text-primary flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">sound_detection_dog_barking</span> 
                              Mascota Encontrada
                            </p>
                            <p className="font-body text-sm text-on-surface mt-0.5">{matchedPet.nombre} <span className="text-on-surface-variant text-xs">({matchedPet.tipo})</span></p>
                          </div>
                        ) : client.ultimaCita ? (
                          <div>
                            <p className="font-body text-xs font-bold text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">history</span> 
                              Última Cita: {client.ultimaCita.fecha}
                            </p>
                            <p className="font-body text-sm text-on-surface mt-0.5">{client.ultimaCita.servicio} <span className="text-tertiary font-bold text-xs bg-tertiary-container/30 px-2 py-0.5 rounded-md ml-1">{client.ultimaCita.mascota}</span></p>
                          </div>
                        ) : (
                          <span className="text-xs text-outline italic">Sin registro de citas</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs font-bold ${client.estado === 'Activo' ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20' : 'bg-outline-variant/20 text-on-surface-variant border border-outline-variant/40'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${client.estado === 'Activo' ? 'bg-[#4CAF50]' : 'bg-outline-variant'}`}></span>
                          {client.estado}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openPetManager(client)} className="w-9 h-9 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary-container/30 transition-colors relative" title="Ver Perfiles de Mascotas">
                            <span className="material-symbols-outlined text-[20px]">pets</span>
                            {pets.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{pets.length}</span>
                            )}
                          </button>
                          <button onClick={() => openEditClient(client)} className="w-9 h-9 rounded-lg flex items-center justify-center text-tertiary hover:bg-tertiary-container/30 transition-colors" title="Editar Cliente">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => openDeleteClient(client)} className="w-9 h-9 rounded-lg flex items-center justify-center text-error hover:bg-error-container/50 transition-colors" title="Eliminar Cliente">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-on-surface-variant font-body">
                    No se encontraron resultados con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL CLIENTE (CREAR / EDITAR) ================= */}
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
            
            {isEditingClient && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-on-surface font-bold text-[15px] font-body">Estado del Cliente (Soft Delete):</label>
                <select value={clientForm.estado} onChange={(e) => setClientForm({...clientForm, estado: e.target.value})} className="w-full pl-3 pr-10 py-3.5 border border-outline-variant rounded-lg font-body text-sm bg-white focus:border-primary focus:ring-1 outline-none">
                  <option value="Activo">Activo (Cuenta Habilitada)</option>
                  <option value="Inactivo">Inactivo (Cuenta Suspendida)</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="outline" type="button" onClick={() => setIsClientModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">{isEditingClient ? 'Guardar Cambios' : 'Registrar Cliente'}</Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL GESTIÓN DE MASCOTAS (CON HISTORIAL CLÍNICO) ================= */}
      <Modal isOpen={isPetManagerOpen} onClose={() => setIsPetManagerOpen(false)} title={selectedClient ? `Pacientes de: ${selectedClient.nombres}` : "Mascotas"} maxWidth="max-w-4xl">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
            <p className="font-body text-sm text-on-surface-variant">Administra el perfil básico y accede al historial médico de cada mascota.</p>
            <Button variant="secondary" onClick={openCreatePet} className="py-2 px-4 text-sm">
              <span className="material-symbols-outlined text-[18px]">add</span> Agregar Mascota
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedClient && getClientPets(selectedClient.idUsuario).map(pet => (
              <div key={pet.idMascota} className="bg-white border border-outline-variant/30 p-5 rounded-2xl shadow-sm flex flex-col relative group">
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditPet(pet)} className="p-1.5 bg-tertiary-container/30 text-tertiary rounded-md hover:bg-tertiary-container/50"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-primary-container/20 rounded-full flex items-center justify-center text-primary shrink-0"><span className="material-symbols-outlined text-3xl">cruelty_free</span></div>
                  <div>
                    <h5 className="font-display text-xl font-bold text-on-surface">{pet.nombre}</h5>
                    <p className="font-body text-sm text-on-surface-variant">{pet.tipo} • {pet.raza}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-body text-on-surface-variant bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 mb-4">
                  <p><strong>Edad:</strong> {pet.edad}</p>
                  <p><strong>Peso:</strong> {pet.peso}</p>
                  <p className="col-span-2 text-error"><strong>Alergias:</strong> {pet.alergias}</p>
                </div>

                <button 
                  onClick={() => navigateToClinicalHistory(pet.idMascota)}
                  className="w-full mt-auto bg-surface-container hover:bg-primary-container hover:text-primary-dark text-on-surface font-body text-sm font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-outline-variant/30 hover:border-primary/30"
                >
                  <span className="material-symbols-outlined text-[18px]">medical_information</span>
                  Abrir Historial Clínico
                </button>
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

      {/* ================= MODAL ELIMINAR CLIENTE ================= */}
      <Modal isOpen={isDeleteClientModalOpen} onClose={() => setIsDeleteClientModalOpen(false)} title="Eliminar Cliente" maxWidth="max-w-[480px]">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-start gap-5 mb-6 mt-2">
            <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[28px] icon-fill">warning</span>
            </div>
            <div className="flex-1 text-left mt-1">
              <h4 className="font-display text-xl font-bold text-on-surface mb-2">¿Estás seguro?</h4>
              <p className="font-body text-[15px] text-on-surface-variant w-full leading-relaxed">
                Estás a punto de eliminar permanentemente a este usuario y todos sus datos asociados. Para mantener el historial de ventas, te sugerimos utilizar la opción de <strong>"Inactivo"</strong> en la ventana de edición.
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-end gap-3 w-full pt-5 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsDeleteClientModalOpen(false)}>Cancelar</Button>
            <Button variant="action" onClick={confirmDeleteClient} className="shadow-none px-6 bg-error border-error hover:bg-error/90">
              Sí, Eliminar
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}