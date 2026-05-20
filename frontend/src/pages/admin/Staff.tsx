import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';

// Mock de datos con más variedad para probar los filtros
const mockStaff = [
  { idUsuario: '101', nombres: 'Juan', apPat: 'Pérez', apMat: 'Gómez', correo: 'juan.vet@vetcare.com', rol: 'Veterinario' },
  { idUsuario: '102', nombres: 'Ana', apPat: 'Gómez', apMat: 'Ruiz', correo: 'ana.est@vetcare.com', rol: 'Estilista' },
  { idUsuario: '103', nombres: 'Luis', apPat: 'Díaz', apMat: 'Vera', correo: 'luis.admin@vetcare.com', rol: 'Administrador' },
  { idUsuario: '104', nombres: 'Marta', apPat: 'Ruiz', apMat: 'Soto', correo: 'marta.rec@vetcare.com', rol: 'Recepcionista' },
  { idUsuario: '105', nombres: 'Carlos', apPat: 'López', apMat: 'Paz', correo: 'carlos.vet@vetcare.com', rol: 'Veterinario' },
];

export default function Staff() {
  // ================= ESTADOS DE FILTRADO =================
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');

  // ================= ESTADOS DE MODALES Y FORMULARIO =================
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Estado del formulario mapeado a las tablas de la BD (USUARIO, EMPLEADO, VETERINARIO, etc.)
  const initialFormState = {
    nombres: '', apPat: '', apMat: '', cel: '', correo: '', genero: '', contrasenia: '',
    salario: '', horaIngreso: '', horaSalida: '',
    rol: 'Veterinario', 
    nvlAcceso: '', departamento: '', especializacion: '', titulo: '', rolEstilista: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // ================= LÓGICA DE FILTRADO REAL =================
  const filteredStaff = mockStaff.filter((staff) => {
    const fullName = `${staff.nombres} ${staff.apPat} ${staff.apMat}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || staff.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || staff.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  // ================= MANEJADORES DE EVENTOS =================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const openEditModal = (staff: any) => {
    setFormData({ ...initialFormState, nombres: staff.nombres, apPat: staff.apPat, correo: staff.correo, rol: staff.rol });
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setSelectedStaffId(id);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando al Backend (NestJS):", formData);
    setIsFormModalOpen(false);
  };

  const confirmDelete = () => {
    console.log("Eliminando registro ID:", selectedStaffId);
    // Aquí irá tu llamada axios.delete(`/api/empleados/${selectedStaffId}`)
    setIsDeleteModalOpen(false);
    setSelectedStaffId(null);
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Cabecera Principal */}
      <header className="pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">Gestión de Personal</h2>
          <p className="font-body text-lg text-on-surface-variant">Administra los accesos y roles de tu equipo de trabajo.</p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl shadow-ambient">
          <span className="material-symbols-outlined font-bold text-[20px]">add</span>
          NUEVO EMPLEADO
        </Button>
      </header>

      {/* Tarjeta de Gestión (Filtros + Tabla) */}
      <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 flex flex-col flex-1 overflow-hidden">
        
        {/* Controles de Filtrado */}
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[22px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline/70"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="font-body text-sm font-bold text-on-surface-variant whitespace-nowrap">Filtrar por Rol:</label>
            <div className="relative w-full md:w-48">
              <select 
                className="appearance-none w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm font-bold pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="Todos">Todos los roles</option>
                <option value="Administrador">Administrador</option>
                <option value="Veterinario">Veterinario</option>
                <option value="Estilista">Estilista</option>
                <option value="Recepcionista">Recepcionista</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b-2 border-outline-variant/30">
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider w-24">ID</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Rol</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-white">
              
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.idUsuario} className="hover:bg-surface-container/30 transition-colors group">
                    <td className="py-4 px-6 font-body text-sm font-bold text-on-surface-variant/80">#{staff.idUsuario}</td>
                    <td className="py-4 px-6 font-body text-sm font-bold text-on-surface">{staff.nombres} {staff.apPat}</td>
                    <td className="py-4 px-6 font-body text-sm text-on-surface-variant">{staff.correo}</td>
                    <td className="py-4 px-6">
                      
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-body text-xs font-bold border
                        ${staff.rol === 'Veterinario' ? 'bg-tertiary-container/30 text-tertiary border-tertiary/20' : 
                          staff.rol === 'Administrador' ? 'bg-primary-container/30 text-primary border-primary/20' : 
                          staff.rol === 'Estilista' ? 'bg-secondary-container/30 text-secondary border-secondary/20' : 
                          'bg-surface-dim text-on-surface-variant border-outline-variant/30'}`}
                      >
                        {staff.rol}
                      </span>

                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(staff)} className="w-8 h-8 rounded-lg flex items-center justify-center text-tertiary hover:bg-tertiary-container/50 transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => openDeleteModal(staff.idUsuario)} className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/50 transition-colors" title="Eliminar">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant font-body">
                    No se encontraron empleados con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          MODAL DE CREAR / EDITAR EMPLEADO
      ========================================= */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={isEditing ? "Editar Empleado" : "Registrar Nuevo Empleado"} maxWidth="max-w-4xl">
        <form onSubmit={handleFormSubmit} className="space-y-8">
          
          <div>
            <h4 className="font-display text-lg font-bold text-primary mb-4 border-b border-outline-variant/30 pb-2">1. Datos Personales (Usuario)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Nombres:" icon="person" name="nombres" value={formData.nombres} onChange={handleInputChange} required />
              <InputField label="Apellido Paterno:" icon="person" name="apPat" value={formData.apPat} onChange={handleInputChange} required />
              <InputField label="Apellido Materno:" icon="person" name="apMat" value={formData.apMat} onChange={handleInputChange} />
              <InputField label="Celular:" icon="call" name="cel" value={formData.cel} onChange={handleInputChange} required />
              <InputField label="Correo Electrónico:" icon="mail" type="email" name="correo" value={formData.correo} onChange={handleInputChange} required />
              
              <div className="space-y-1.5">
                <label className="block text-on-surface font-bold text-[15px] font-body">Género:</label>
                <select name="genero" value={formData.genero} onChange={handleInputChange} className="w-full pl-3 pr-10 py-3.5 border border-outline-variant rounded-lg font-body text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              
              {!isEditing && (
                <InputField label="Contraseña de Acceso:" icon="lock" name="contrasenia" isPassword value={formData.contrasenia} onChange={handleInputChange} required />
              )}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold text-primary mb-4 border-b border-outline-variant/30 pb-2">2. Datos Laborales (Empleado)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Salario Base ($):" icon="payments" type="number" name="salario" value={formData.salario} onChange={handleInputChange} required />
              <InputField label="Hora de Ingreso:" icon="schedule" type="time" name="horaIngreso" value={formData.horaIngreso} onChange={handleInputChange} required />
              <InputField label="Hora de Salida:" icon="schedule" type="time" name="horaSalida" value={formData.horaSalida} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
            <h4 className="font-display text-lg font-bold text-primary mb-4">3. Asignación de Rol y Especialidad</h4>
            
            <div className="mb-6 w-full md:w-1/3">
              <label className="block text-on-surface font-bold text-[15px] font-body mb-1.5">Rol en el Sistema:</label>
              <select name="rol" value={formData.rol} onChange={handleInputChange} className="w-full pl-3 pr-10 py-3.5 border border-primary rounded-lg font-body text-sm font-bold bg-white text-primary focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="Administrador">Administrador</option>
                <option value="Recepcionista">Recepcionista</option>
                <option value="Veterinario">Veterinario</option>
                <option value="Estilista">Estilista</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.rol === 'Administrador' && (
                <InputField label="Nivel de Acceso:" icon="admin_panel_settings" name="nvlAcceso" value={formData.nvlAcceso} onChange={handleInputChange} placeholder="Ej. Nivel 1" required />
              )}
              {formData.rol === 'Recepcionista' && (
                <InputField label="Departamento asignado:" icon="desk" name="departamento" value={formData.departamento} onChange={handleInputChange} placeholder="Ej. Admisión Principal" required />
              )}
              {formData.rol === 'Veterinario' && (
                <>
                  <InputField label="Especialización:" icon="local_hospital" name="especializacion" value={formData.especializacion} onChange={handleInputChange} placeholder="Ej. Cirugía, General..." required />
                  <InputField label="Título Profesional:" icon="school" name="titulo" value={formData.titulo} onChange={handleInputChange} placeholder="Ej. MVZ" required />
                </>
              )}
              {formData.rol === 'Estilista' && (
                <InputField label="Rol Técnico:" icon="content_cut" name="rolEstilista" value={formData.rolEstilista} onChange={handleInputChange} placeholder="Ej. Peluquería Canina" required />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Guardar Cambios' : 'Registrar Empleado'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================
          MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
      ========================================= */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Eliminar Personal" 
        maxWidth="max-w-[480px]" 
      >
        <div className="flex flex-col w-full">
          
          {/* Distribución Horizontal: Ícono a la izquierda, Texto a la derecha */}
          <div className="flex flex-row items-start gap-5 mb-6 mt-2">
            
            {/* Ícono más compacto y proporcionado */}
            <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[28px] icon-fill">warning</span>
            </div>
            
            {/* Contenedor del texto con flex-1 para que ocupe todo el espacio sobrante */}
            <div className="flex-1 text-left mt-1">
              <h4 className="font-display text-xl font-bold text-on-surface mb-2">
                ¿Estás seguro?
              </h4>
              {/* w-full asegura que el texto fluya horizontalmente de forma natural */}
              <p className="font-body text-[15px] text-on-surface-variant w-full leading-relaxed">
                Esta acción es permanente. Eliminará a este usuario y revocará todos sus accesos al sistema inmediatamente.
              </p>
            </div>

          </div>
          
          {/* Botones alineados a la derecha de forma más sutil */}
          <div className="flex flex-row justify-end gap-3 w-full pt-5 border-t border-outline-variant/20">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="action" 
              onClick={confirmDelete} 
              className="bg-error border-error hover:bg-error/90 shadow-none px-6"
            >
              Eliminar
            </Button>
          </div>

        </div>
      </Modal>

    </div>
  );
}