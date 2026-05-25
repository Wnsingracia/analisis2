import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';
import api from '../../services/api'; // ◄ Importamos tu instancia de Axios

// Interface basada en el mapeo INNER JOIN de tu tabla de Postgres
interface Empleado {
  id_usuario: number;
  nombres: string;
  ap_pat: string;
  ap_mat: string | null;
  cel: string;
  correo: string;
  genero: string;
  tipo_usuario: string; // 'ADMIN', 'VETERINARIO', 'ESTILISTA', 'RECEPCIONISTA'
  salario: number;
  hora_ingreso: string;
  hora_salida: string;
  // Campos polimórficos adicionales de las subtablas
  nvl_acceso?: string;
  departamento?: string;
  especializacion?: string;
  titulo?: string;
  rol?: string; // Especialidad del estilista en Postgres
}

export default function Staff() {
  // ================= ESTADOS DE DATOS REALES =================
  const [staffList, setStaffList] = useState<Empleado[]>([]);
  const [cargando, setCargando] = useState(true);

  // ================= ESTADOS DE FILTRADO =================
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');

  // ================= ESTADOS DE MODALES Y FORMULARIO =================
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  // Estado inicial mapeado al 100% con tu método inserta() de NestJS
  const initialFormState = {
    nombres: '', ap_pat: '', ap_mat: '', cel: '', correo: '', genero: '', contrasenia: '',
    salario: '', hora_ingreso: '', hora_salida: '',
    tipo_usuario: 'VETERINARIO', 
    nvl_acceso: '', departamento: '', especializacion: '', titulo: '', rol: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // ================= FETCH DE DATOS DESDE POSTGRES =================
  const cargarEmpleados = async () => {
    setCargando(true);
    try {
      const response = await api.get('/usuarios/empleados');
      setStaffList(response.data);
    } catch (error) {
      console.error("Error al recuperar el personal:", error);
      alert("No se pudo sincronizar la lista de empleados.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // ================= LÓGICA DE FILTRADO REAL =================
  const filteredStaff = staffList.filter((staff) => {
    const fullName = `${staff.nombres} ${staff.ap_pat} ${staff.ap_mat || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || staff.correo.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Convertimos los roles de Postgres para que hagan match con el filtro visual
    const matchesRole = roleFilter === 'Todos' || staff.tipo_usuario === roleFilter;
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

  const openEditModal = (staff: Empleado) => {
    setSelectedStaffId(staff.id_usuario);
    setFormData({
      nombres: staff.nombres,
      ap_pat: staff.ap_pat,
      ap_mat: staff.ap_mat || '',
      cel: staff.cel,
      correo: staff.correo,
      genero: staff.genero,
      contrasenia: '', // No enviamos contraseña al editar por seguridad
      salario: staff.salario.toString(),
      hora_ingreso: staff.hora_ingreso,
      hora_salida: staff.hora_salida,
      tipo_usuario: staff.tipo_usuario,
      nvl_acceso: staff.nvl_acceso || '',
      departamento: staff.departamento || '',
      especializacion: staff.especializacion || '',
      titulo: staff.titulo || '',
      rol: staff.rol || ''
    });
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setSelectedStaffId(id);
    setIsDeleteModalOpen(true);
  };

  // ================= GUARDAR / ACTUALIZAR (POST / PUT) =================
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Enviar modificaciones al endpoint de NestJS (Ej: PUT /usuarios/empleados/:id)
        await api.put(`/usuarios/empleados/${selectedStaffId}`, formData);
        alert("Datos del empleado actualizados con éxito.");
      } else {
        // Enviar nueva inserción por transacciones a Postgres
        await api.post('/usuarios/inserta', formData);
        alert(`Empleado [${formData.tipo_usuario}] registrado correctamente.`);
      }
      setIsFormModalOpen(false);
      cargarEmpleados(); // Recargamos la grilla con los datos frescos de la BD
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Ocurrió un error al procesar el formulario.");
    }
  };

  // ================= ELIMINACIÓN REAL (DELETE) =================
  const confirmDelete = async () => {
    if (!selectedStaffId) return;
    try {
      await api.delete(`/usuarios/empleados/${selectedStaffId}`);
      alert("Registro eliminado de la base de datos.");
      setIsDeleteModalOpen(false);
      setSelectedStaffId(null);
      cargarEmpleados();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "No se pudo eliminar al empleado.");
    }
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
                <option value="ADMIN">Administrador</option>
                <option value="VETERINARIO">Veterinario</option>
                <option value="ESTILISTA">Estilista</option>
                <option value="RECEPCIONISTA">Recepcionista</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* Tabla de Resultados Dinámica */}
        <div className="overflow-x-auto flex-1">
          {cargando ? (
            <div className="p-12 text-center font-body text-sm text-on-surface-variant animate-pulse">
              Consultando personal activo en Postgres...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low/50 border-b-2 border-outline-variant/30">
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider w-24">ID</th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre</th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo</th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Rol en Sistema</th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 bg-white">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id_usuario} className="hover:bg-surface-container/30 transition-colors group">
                      <td className="py-4 px-6 font-body text-sm font-bold text-primary">#{staff.id_usuario}</td>
                      <td className="py-4 px-6 font-body text-sm font-bold text-on-surface">{staff.nombres} {staff.ap_pat} {staff.ap_mat || ''}</td>
                      <td className="py-4 px-6 font-body text-sm text-on-surface-variant">{staff.correo}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full font-body text-xs font-bold border
                          ${staff.tipo_usuario === 'VETERINARIO' ? 'bg-tertiary-container/30 text-tertiary border-tertiary/20' : 
                            staff.tipo_usuario === 'ADMIN' ? 'bg-primary-container/30 text-primary border-primary/20' : 
                            staff.tipo_usuario === 'ESTILISTA' ? 'bg-secondary-container/30 text-secondary border-secondary/20' : 
                            'bg-surface-dim text-on-surface-variant border-outline-variant/30'}`}
                        >
                          {staff.tipo_usuario}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(staff)} className="w-8 h-8 rounded-lg flex items-center justify-center text-tertiary hover:bg-tertiary-container/50 transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => openDeleteModal(staff.id_usuario)} className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/50 transition-colors" title="Eliminar">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant font-body">
                      No se encontraron empleados registrados en la sucursal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =========================================
          MODAL DE CREAR / EDITAR EMPLEADO
      ========================================= */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={isEditing ? "Editar Datos de Empleado" : "Registrar Nuevo Empleado"} maxWidth="max-w-4xl">
        <form onSubmit={handleFormSubmit} className="space-y-8">
          
          <div>
            <h4 className="font-display text-lg font-bold text-primary mb-4 border-b border-outline-variant/30 pb-2">1. Datos Personales (Usuario)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Nombres:" icon="person" name="nombres" value={formData.nombres} onChange={handleInputChange} required />
              <InputField label="Apellido Paterno:" icon="person" name="ap_pat" value={formData.ap_pat} onChange={handleInputChange} required />
              <InputField label="Apellido Materno:" icon="person" name="ap_mat" value={formData.ap_mat} onChange={handleInputChange} />
              <InputField label="Celular:" icon="call" name="cel" value={formData.cel} onChange={handleInputChange} required />
              <InputField label="Correo Electrónico:" icon="mail" type="email" name="correo" value={formData.correo} onChange={handleInputChange} required />
              
              <div className="space-y-1.5">
                <label className="block text-on-surface font-bold text-[15px] font-body">Género:</label>
                <select name="genero" value={formData.genero} onChange={handleInputChange} className="w-full pl-3 pr-10 py-3.5 border border-outline-variant rounded-lg font-body text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" required>
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
              <InputField label="Hora de Ingreso:" icon="schedule" type="time" name="hora_ingreso" value={formData.hora_ingreso} onChange={handleInputChange} required />
              <InputField label="Hora de Salida:" icon="schedule" type="time" name="hora_salida" value={formData.hora_salida} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
            <h4 className="font-display text-lg font-bold text-primary mb-4">3. Asignación de Rol y Especialidad</h4>
            
            <div className="mb-6 w-full md:w-1/3">
              <label className="block text-on-surface font-bold text-[15px] font-body mb-1.5">Rol en el Sistema:</label>
              <select name="tipo_usuario" value={formData.tipo_usuario} onChange={handleInputChange} className="w-full pl-3 pr-10 py-3.5 border border-primary rounded-lg font-body text-sm font-bold bg-white text-primary focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="ADMIN">Administrador</option>
                <option value="RECEPCIONISTA">Recepcionista</option>
                <option value="VETERINARIO">Veterinario</option>
                <option value="ESTILISTA">Estilista</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.tipo_usuario === 'ADMIN' && (
                <InputField label="Nivel de Acceso:" icon="admin_panel_settings" name="nvl_acceso" value={formData.nvl_acceso} onChange={handleInputChange} placeholder="Ej. Nivel 1" required />
              )}
              {formData.tipo_usuario === 'RECEPCIONISTA' && (
                <InputField label="Departamento asignado:" icon="desk" name="departamento" value={formData.departamento} onChange={handleInputChange} placeholder="Ej. Admisión Principal" required />
              )}
              {formData.tipo_usuario === 'VETERINARIO' && (
                <>
                  <InputField label="Especialización:" icon="local_hospital" name="especializacion" value={formData.especializacion} onChange={handleInputChange} placeholder="Ej. Cirugía, General..." required />
                  <InputField label="Título Profesional:" icon="school" name="titulo" value={formData.titulo} onChange={handleInputChange} placeholder="Ej. MVZ" required />
                </>
              )}
              {formData.tipo_usuario === 'ESTILISTA' && (
                <InputField label="Rol Técnico:" icon="content_cut" name="rol" value={formData.rol} onChange={handleInputChange} placeholder="Ej. Peluquería Canina" required />
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
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar Personal" maxWidth="max-w-[480px]">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-start gap-5 mb-6 mt-2">
            <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[28px] icon-fill">warning</span>
            </div>
            <div className="flex-1 text-left mt-1">
              <h4 className="font-display text-xl font-bold text-on-surface mb-2">¿Estás seguro?</h4>
              <p className="font-body text-[15px] text-on-surface-variant w-full leading-relaxed">
                Esta acción es permanente. Eliminará a este usuario y revocará todos sus accesos al sistema inmediatamente de Postgres.
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-end gap-3 w-full pt-5 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="action" onClick={confirmDelete} className="bg-error border-error hover:bg-error/90 shadow-none px-6">
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}