
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';
import api from '../../services/api';

// ================= TIPOS DEL BACKEND =================

interface Usuario {
  id_usuario: string;
  nombres: string;
  ap_pat: string;
  ap_mat?: string | null;
  cel?: number | string | null;
  correo: string;
  genero?: string | null;
  tipo_usuario: string;
  estado: 'ACTIVA' | 'SUSPENDIDA' | 'REVOCADA';
}

interface ClienteApi {
  id_usuario: string;
  nro_cuenta?: string | null;
  direccion?: string | null;
  nit?: string | null;
  usuario: Usuario;
}

interface Mascota {
  id_mascota: string;
  id_cliente: string;
  nombre: string;
  tipo: string;
  raza: string;
  edad?: number | null;
  peso?: number | null;
  altura?: number | null;
  alergias?: string | null;
  genero?: string | null;
}

interface Cita {
  id_cita: string;
  id_cliente: string;
  id_mascota: string;
  fecha: string;
  hora?: string;
  tipo?: string;
  descripcion?: string;
  mascota_nombre?: string;
}

interface Cliente {
  idUsuario: string;
  nombres: string;
  apPat: string;
  apMat: string;
  cel: string;
  correo: string;
  direccion: string;
  nit: string;
  nro_cuenta: string;
  estado: string;
  ultimaCita?: {
    fecha: string;
    mascota: string;
    servicio: string;
  } | null;
}

interface ClientForm {
  nombres: string;
  apPat: string;
  apMat: string;
  cel: string;
  correo: string;
  genero: string;
  contrasenia: string;
  direccion: string;
  nit: string;
  nro_cuenta: string;
  estado: string;
}

interface PetForm {
  nombre: string;
  tipo: string;
  raza: string;
  edad: string;
  peso: string;
  altura: string;
  alergias: string;
  genero: string;
}

const emptyClientForm: ClientForm = {
  nombres: '',
  apPat: '',
  apMat: '',
  cel: '',
  correo: '',
  genero: '',
  contrasenia: '',
  direccion: '',
  nit: '',
  nro_cuenta: '',
  estado: 'ACTIVA',
};

const emptyPetForm: PetForm = {
  nombre: '',
  tipo: '',
  raza: '',
  edad: '',
  peso: '',
  altura: '',
  alergias: 'Ninguna',
  genero: '',
};

// ================= FUNCIONES AUXILIARES =================

const mensajeError = (error: any, predeterminado: string) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.mensaje ||
    predeterminado
  );
};

const formatearFecha = (fecha?: string) => {
  if (!fecha) return 'Sin registro';

  const partes = String(fecha).slice(0, 10).split('-');

  if (partes.length !== 3) return fecha;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

export default function Clients() {
  const location = useLocation();
  const navigate = useNavigate();

  // ================= DATOS =================

  const [clients, setClients] = useState<Cliente[]>([]);
  const [pets, setPets] = useState<Mascota[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingPets, setLoadingPets] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ================= FILTROS =================

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // ================= MODALES CLIENTE =================

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  // ================= MODALES MASCOTA =================

  const [isPetManagerOpen, setIsPetManagerOpen] = useState(false);
  const [isPetFormModalOpen, setIsPetFormModalOpen] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // ================= FORMULARIOS =================

  const [clientForm, setClientForm] = useState<ClientForm>(emptyClientForm);
  const [petForm, setPetForm] = useState<PetForm>(emptyPetForm);

  // ================= CARGA DE DATOS =================

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const [clientesRes, mascotasRes, citasRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/mascotas'),
        api.get('/citas/agenda').catch(() => ({ data: [] })),
      ]);

      const clientesApi: ClienteApi[] = clientesRes.data || [];
      const mascotasApi: Mascota[] = mascotasRes.data || [];
      const citasApi: Cita[] = citasRes.data || [];

      const clientesAdaptados: Cliente[] = clientesApi
        .filter((item) => item.usuario)
        .map((item) => ({
          idUsuario: String(item.id_usuario),
          nombres: item.usuario.nombres || '',
          apPat: item.usuario.ap_pat || '',
          apMat: item.usuario.ap_mat || '',
          cel: String(item.usuario.cel ?? ''),
          correo: item.usuario.correo || '',
          direccion: item.direccion || '',
          nit: item.nit || '',
          nro_cuenta: item.nro_cuenta || '',
          estado: item.usuario.estado,
          ultimaCita: null,
        }));

      // Las citas ya llegan ordenadas de más reciente a más antigua.
      const clientesConCitas = clientesAdaptados.map((cliente) => {
        const ultima = citasApi.find(
          (cita) => String(cita.id_cliente) === cliente.idUsuario,
        );

        return {
          ...cliente,
          ultimaCita: ultima
            ? {
                fecha: ultima.fecha,
                mascota:
                  ultima.mascota_nombre ||
                  mascotasApi.find(
                    (m) =>
                      String(m.id_mascota) === String(ultima.id_mascota) &&
                      String(m.id_cliente) === cliente.idUsuario,
                  )?.nombre ||
                  'Mascota',
                servicio: ultima.tipo || ultima.descripcion || 'Consulta',
              }
            : null,
        };
      });

      setClients(clientesConCitas);
      setPets(mascotasApi);
      setCitas(citasApi);
    } catch (error: any) {
      setErrorMessage(
        mensajeError(error, 'No se pudieron cargar los clientes y mascotas.'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Búsqueda enviada desde el TopBar
  useEffect(() => {
    if (location.state?.searchName) {
      setSearchTerm(location.state.searchName);
    }
  }, [location.state]);

  // ================= MASCOTAS DE UN CLIENTE =================

  const getClientPets = (clientId: string) =>
    pets.filter((pet) => String(pet.id_cliente) === String(clientId));

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const mascotasCliente = getClientPets(client.idUsuario);

      const termino = searchTerm.toLowerCase().trim();

      const coincideMascota = mascotasCliente.some((pet) =>
        pet.nombre.toLowerCase().includes(termino),
      );

      const coincideBusqueda =
        `${client.nombres} ${client.apPat} ${client.apMat}`
          .toLowerCase()
          .includes(termino) ||
        client.correo.toLowerCase().includes(termino) ||
        coincideMascota;

      const estadoCliente =
        client.estado === 'ACTIVA'
          ? 'Activo'
          : client.estado === 'SUSPENDIDA'
            ? 'Inactivo'
            : 'Revocado';

      const coincideEstado =
        statusFilter === 'Todos' || estadoCliente === statusFilter;

      return coincideBusqueda && coincideEstado;
    });
  }, [clients, pets, searchTerm, statusFilter]);

  // ================= MENSAJES =================

  const mostrarExito = (mensaje: string) => {
    setSuccessMessage(mensaje);
    setErrorMessage('');
    window.setTimeout(() => setSuccessMessage(''), 4000);
  };

  const mostrarError = (mensaje: string) => {
    setErrorMessage(mensaje);
    setSuccessMessage('');
  };

  // ================= CLIENTES =================

  const openCreateClient = () => {
    setClientForm(emptyClientForm);
    setSelectedClient(null);
    setIsEditingClient(false);
    setIsClientModalOpen(true);
  };

  const openEditClient = (client: Cliente) => {
    setSelectedClient(client);

    setClientForm({
      nombres: client.nombres,
      apPat: client.apPat,
      apMat: client.apMat,
      cel: client.cel,
      correo: client.correo,
      genero: '',
      contrasenia: '',
      direccion: client.direccion,
      nit: client.nit,
      nro_cuenta: client.nro_cuenta,
      estado: client.estado,
    });

    setIsEditingClient(true);
    setIsClientModalOpen(true);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setErrorMessage('');

    try {
      if (!isEditingClient) {
        // POST /clientes crea el usuario y su registro de cliente.
        const payload = {
          nombres: clientForm.nombres.trim(),
          ap_pat: clientForm.apPat.trim(),
          ap_mat: clientForm.apMat.trim() || undefined,
          cel: clientForm.cel.trim() || undefined,
          correo: clientForm.correo.trim(),
          genero: clientForm.genero || undefined,
          contrasenia: clientForm.contrasenia,
          direccion: clientForm.direccion.trim() || undefined,
          nit: clientForm.nit.trim() || undefined,
          nro_cuenta: clientForm.nro_cuenta.trim() || undefined,
        };

        await api.post('/clientes', payload);

        mostrarExito('Cliente registrado correctamente.');
      } else {
        if (!selectedClient) return;

        const id = selectedClient.idUsuario;

        // Los datos personales pertenecen a usuarios.
        const datosPersonales: Record<string, any> = {};

        if (clientForm.nombres.trim()) {
          datosPersonales.nombres = clientForm.nombres.trim();
        }

        if (clientForm.apPat.trim()) {
          datosPersonales.ap_pat = clientForm.apPat.trim();
        }

        if (clientForm.apMat.trim()) {
          datosPersonales.ap_mat = clientForm.apMat.trim();
        }

        if (clientForm.cel.trim()) {
          datosPersonales.cel = clientForm.cel.trim();
        }

        if (clientForm.correo.trim()) {
          datosPersonales.correo = clientForm.correo.trim();
        }

        if (clientForm.contrasenia.trim()) {
          datosPersonales.contrasenia = clientForm.contrasenia;
        }

        // Los datos de facturación pertenecen a clientes.
        const datosFacturacion: Record<string, any> = {};

        if (clientForm.direccion.trim()) {
          datosFacturacion.direccion = clientForm.direccion.trim();
        }

        if (clientForm.nit.trim()) {
          datosFacturacion.nit = clientForm.nit.trim();
        }

        if (clientForm.nro_cuenta.trim()) {
          datosFacturacion.nro_cuenta = clientForm.nro_cuenta.trim();
        }

        // Actualización de los datos personales.
        if (Object.keys(datosPersonales).length > 0) {
          await api.put(`/usuarios/${id}`, datosPersonales);
        }

        // Actualización de los datos propios del cliente.
        if (Object.keys(datosFacturacion).length > 0) {
          await api.put(`/clientes/${id}`, datosFacturacion);
        }

        // Suspensión o reactivación de una cuenta.
        if (clientForm.estado !== selectedClient.estado) {
          const motivo = window.prompt(
            clientForm.estado === 'SUSPENDIDA'
              ? 'Indica el motivo de la suspensión:'
              : 'Indica el motivo de la reactivación:',
          );

          if (motivo === null || !motivo.trim()) {
            throw new Error('Debes indicar el motivo del cambio de estado.');
          }

          await api.patch(`/usuarios/${id}/estado`, {
            estado: clientForm.estado,
            motivo: motivo.trim(),
          });
        }

        mostrarExito('Cliente actualizado correctamente.');
      }

      setIsClientModalOpen(false);
      await cargarDatos();
    } catch (error: any) {
      mostrarError(
        mensajeError(error, error.message || 'No se pudo guardar el cliente.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteClient = (client: Cliente) => {
    setSelectedClient(client);
    setIsDeleteClientModalOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!selectedClient || saving) return;

    setSaving(true);

    try {
      // Baja lógica: no elimina el historial.
      await api.delete(`/clientes/${selectedClient.idUsuario}`);

      setIsDeleteClientModalOpen(false);
      setSelectedClient(null);

      mostrarExito('Cliente dado de baja correctamente.');
      await cargarDatos();
    } catch (error: any) {
      mostrarError(
        mensajeError(error, 'No se pudo dar de baja al cliente.'),
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= GESTIÓN DE MASCOTAS =================

  const openPetManager = async (client: Cliente) => {
    setSelectedClient(client);
    setIsPetManagerOpen(true);
    setLoadingPets(true);

    try {
      const respuesta = await api.get('/mascotas', {
        params: { id_cliente: client.idUsuario },
      });

      const mascotasCliente: Mascota[] = respuesta.data || [];

      setPets((actuales) => [
        ...actuales.filter(
          (pet) => String(pet.id_cliente) !== client.idUsuario,
        ),
        ...mascotasCliente,
      ]);
    } catch (error: any) {
      mostrarError(
        mensajeError(error, 'No se pudieron cargar las mascotas.'),
      );
    } finally {
      setLoadingPets(false);
    }
  };

  const openCreatePet = () => {
    setPetForm(emptyPetForm);
    setSelectedPetId(null);
    setIsEditingPet(false);
    setIsPetFormModalOpen(true);
  };

  const openEditPet = (pet: Mascota) => {
    setSelectedPetId(String(pet.id_mascota));

    setPetForm({
      nombre: pet.nombre || '',
      tipo: pet.tipo || '',
      raza: pet.raza || '',
      edad: pet.edad != null ? String(pet.edad) : '',
      peso: pet.peso != null ? String(pet.peso) : '',
      altura: pet.altura != null ? String(pet.altura) : '',
      alergias: pet.alergias || 'Ninguna',
      genero: pet.genero || '',
    });

    setIsEditingPet(true);
    setIsPetFormModalOpen(true);
  };

  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || saving) return;

    setSaving(true);

    try {
      const edad = petForm.edad.trim()
        ? Number(petForm.edad)
        : undefined;

      const peso = petForm.peso.trim()
        ? Number(petForm.peso)
        : undefined;

      const altura = petForm.altura.trim()
        ? Number(petForm.altura)
        : undefined;

      if (edad !== undefined && (!Number.isInteger(edad) || edad < 0)) {
        throw new Error('La edad debe ser un número entero válido.');
      }

      if (peso !== undefined && (!Number.isFinite(peso) || peso < 0)) {
        throw new Error('El peso debe ser un número válido.');
      }

      if (altura !== undefined && (!Number.isFinite(altura) || altura < 0)) {
        throw new Error('La altura debe ser un número válido.');
      }

      const payload = {
        nombre: petForm.nombre.trim(),
        tipo: petForm.tipo,
        raza: petForm.raza.trim(),
        edad,
        peso,
        altura,
        alergias: petForm.alergias.trim(),
        genero: petForm.genero || undefined,
      };

      if (isEditingPet && selectedPetId) {
        // El backend requiere id_cliente para identificar correctamente
        // a la mascota, porque el identificador puede repetirse.
        await api.put(
          `/mascotas/${selectedPetId}`,
          payload,
          { params: { id_cliente: selectedClient.idUsuario } },
        );

        mostrarExito('Mascota actualizada correctamente.');
      } else {
        await api.post('/mascotas', {
          ...payload,
          id_cliente: selectedClient.idUsuario,
        });

        mostrarExito('Mascota registrada correctamente.');
      }

      setIsPetFormModalOpen(false);

      // Actualizar la lista de mascotas del cliente.
      const respuesta = await api.get('/mascotas', {
        params: { id_cliente: selectedClient.idUsuario },
      });

      const mascotasCliente: Mascota[] = respuesta.data || [];

      setPets((actuales) => [
        ...actuales.filter(
          (pet) => String(pet.id_cliente) !== selectedClient.idUsuario,
        ),
        ...mascotasCliente,
      ]);
    } catch (error: any) {
      mostrarError(
        mensajeError(error, error.message || 'No se pudo guardar la mascota.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const eliminarMascota = async (pet: Mascota) => {
    if (!selectedClient) return;

    const confirmar = window.confirm(
      `¿Deseas eliminar a ${pet.nombre}? Esta operación no se puede deshacer.`,
    );

    if (!confirmar) return;

    try {
      // DELETE /mascotas/:id es exclusivo de ADMIN.
      await api.delete(`/mascotas/${pet.id_mascota}`, {
        params: { id_cliente: selectedClient.idUsuario },
      });

      setPets((actuales) =>
        actuales.filter(
          (item) =>
            !(
              String(item.id_mascota) === String(pet.id_mascota) &&
              String(item.id_cliente) === selectedClient.idUsuario
            ),
        ),
      );

      mostrarExito('Mascota eliminada correctamente.');
    } catch (error: any) {
      mostrarError(
        mensajeError(error, 'No se pudo eliminar la mascota.'),
      );
    }
  };

  // ================= HISTORIAL CLÍNICO =================

const navigateToClinicalHistory = (pet: Mascota) => {
  setIsPetManagerOpen(false);

  navigate(
    `/admin/clinical-history/${pet.id_mascota}?id_cliente=${pet.id_cliente}`,
  );
};

  // ================= RENDER =================

  return (
    <div className="flex flex-col h-full relative">

      {/* CABECERA */}

      <header className="pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">
            Clientes y Mascotas
          </h2>
          <p className="font-body text-lg text-on-surface-variant">
            Gestiona dueños, sus perfiles y el acceso rápido al historial clínico.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateClient}
          className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl shadow-ambient"
        >
          <span className="material-symbols-outlined font-bold text-[20px]">
            person_add
          </span>
          NUEVO CLIENTE
        </Button>
      </header>

      {/* MENSAJES */}

      {errorMessage && (
        <div className="mb-4 p-4 rounded-xl bg-error-container/40 text-error border border-error/20 text-sm">
          {errorMessage}
          <button
            onClick={() => setErrorMessage('')}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 rounded-xl bg-green-100 text-green-800 border border-green-200 text-sm">
          {successMessage}
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}

      <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 flex flex-col flex-1 overflow-hidden">

        {/* BÚSQUEDA Y FILTROS */}

        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary text-[22px]">
              search
            </span>

            <input
              type="text"
              placeholder="Buscar dueño, correo o nombre de mascota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline/70"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="font-body text-sm font-bold text-on-surface-variant whitespace-nowrap">
              Estado:
            </label>

            <div className="relative w-full md:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm font-bold pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Suspendidos</option>
              </select>

              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* TABLA */}

        <div className="overflow-x-auto flex-1 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-spin mb-3">
                progress_activity
              </span>
              Cargando clientes y mascotas...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-low/50 border-b-2 border-outline-variant/30">
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Cliente y Contacto
                  </th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Actividad / Mascotas
                  </th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">
                    Estado
                  </th>
                  <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/20">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => {
                    const mascotasCliente = getClientPets(client.idUsuario);

                    const matchedPet = searchTerm
                      ? mascotasCliente.find((pet) =>
                          pet.nombre
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        )
                      : null;

                    const activo = client.estado === 'ACTIVA';

                    return (
                      <tr
                        key={client.idUsuario}
                        className={`hover:bg-surface-container/30 transition-colors ${
                          !activo ? 'opacity-70 bg-surface-container-lowest' : ''
                        }`}
                      >
                        <td className="py-4 px-6">
                          <p className="font-body text-sm font-bold text-on-surface">
                            {client.nombres} {client.apPat} {client.apMat}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-body text-[11px] font-bold text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-md">
                              ID: #{client.idUsuario}
                            </span>

                            <span className="font-body text-xs text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                call
                              </span>
                              {client.cel || 'Sin celular'}
                            </span>
                          </div>

                          <p className="font-body text-xs text-on-surface-variant mt-0.5">
                            {client.correo}
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          {matchedPet ? (
                            <div className="bg-primary-container/10 border border-primary/20 p-2 rounded-lg inline-block">
                              <p className="font-body text-xs font-bold text-primary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">
                                  sound_detection_dog_barking
                                </span>
                                Mascota encontrada
                              </p>

                              <p className="font-body text-sm text-on-surface mt-0.5">
                                {matchedPet.nombre}
                                <span className="text-on-surface-variant text-xs">
                                  {' '}({matchedPet.tipo})
                                </span>
                              </p>
                            </div>
                          ) : client.ultimaCita ? (
                            <div>
                              <p className="font-body text-xs font-bold text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">
                                  history
                                </span>
                                Última cita: {formatearFecha(client.ultimaCita.fecha)}
                              </p>

                              <p className="font-body text-sm text-on-surface mt-0.5">
                                {client.ultimaCita.servicio}
                                <span className="text-tertiary font-bold text-xs bg-tertiary-container/30 px-2 py-0.5 rounded-md ml-1">
                                  {client.ultimaCita.mascota}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-outline italic">
                              Sin registro de citas
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs font-bold ${
                              activo
                                ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20'
                                : 'bg-outline-variant/20 text-on-surface-variant border border-outline-variant/40'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                activo ? 'bg-[#4CAF50]' : 'bg-outline-variant'
                              }`}
                            />
                            {activo ? 'Activo' : 'Suspendido'}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openPetManager(client)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary-container/30 transition-colors relative"
                              title="Ver perfiles de mascotas"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                pets
                              </span>

                              {mascotasCliente.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                  {mascotasCliente.length}
                                </span>
                              )}
                            </button>

                    
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-on-surface-variant font-body"
                    >
                      No se encontraron resultados con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= MODAL CLIENTE ================= */}

      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title={isEditingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleClientSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Nombres:"
              icon="person"
              name="nombres"
              value={clientForm.nombres}
              onChange={(e) =>
                setClientForm({ ...clientForm, nombres: e.target.value })
              }
              required
            />

            <InputField
              label="Apellido Paterno:"
              icon="person"
              name="apPat"
              value={clientForm.apPat}
              onChange={(e) =>
                setClientForm({ ...clientForm, apPat: e.target.value })
              }
              required
            />

            <InputField
              label="Apellido Materno:"
              icon="person"
              name="apMat"
              value={clientForm.apMat}
              onChange={(e) =>
                setClientForm({ ...clientForm, apMat: e.target.value })
              }
            />

            <InputField
              label="Celular:"
              icon="call"
              name="cel"
              value={clientForm.cel}
              onChange={(e) =>
                setClientForm({ ...clientForm, cel: e.target.value })
              }
            />

            <InputField
              label="Correo Electrónico:"
              icon="mail"
              type="email"
              name="correo"
              value={clientForm.correo}
              onChange={(e) =>
                setClientForm({ ...clientForm, correo: e.target.value })
              }
              required
            />

            <InputField
              label="Dirección:"
              icon="location_on"
              name="direccion"
              value={clientForm.direccion}
              onChange={(e) =>
                setClientForm({ ...clientForm, direccion: e.target.value })
              }
            />

            <InputField
              label="NIT / CI:"
              icon="receipt_long"
              name="nit"
              value={clientForm.nit}
              onChange={(e) =>
                setClientForm({ ...clientForm, nit: e.target.value })
              }
            />

            <InputField
              label="Número de cuenta:"
              icon="account_balance"
              name="nro_cuenta"
              value={clientForm.nro_cuenta}
              onChange={(e) =>
                setClientForm({ ...clientForm, nro_cuenta: e.target.value })
              }
            />

            {!isEditingClient && (
              <>
                <InputField
                  label="Contraseña inicial:"
                  icon="lock"
                  type="password"
                  name="contrasenia"
                  value={clientForm.contrasenia}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, contrasenia: e.target.value })
                  }
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-on-surface font-bold text-[15px] font-body">
                    Género:
                  </label>

                  <select
                    value={clientForm.genero}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, genero: e.target.value })
                    }
                    className="w-full pl-3 pr-10 py-3.5 border border-outline-variant rounded-lg font-body text-sm bg-white focus:border-primary focus:ring-1 outline-none"
                  >
                    <option value="">No especificado</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </>
            )}

            {isEditingClient && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-on-surface font-bold text-[15px] font-body">
                    Estado de la cuenta:
                  </label>

                  <select
                    value={clientForm.estado}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, estado: e.target.value })
                    }
                    className="w-full pl-3 pr-10 py-3.5 border border-outline-variant rounded-lg font-body text-sm bg-white focus:border-primary focus:ring-1 outline-none"
                  >
                    <option value="ACTIVA">Activa</option>
                    <option value="SUSPENDIDA">Suspendida</option>
                  </select>
                </div>

                <InputField
                  label="Nueva contraseña (opcional):"
                  icon="lock"
                  type="password"
                  name="contrasenia"
                  value={clientForm.contrasenia}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, contrasenia: e.target.value })
                  }
                />
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsClientModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button variant="primary" type="submit" disabled={saving}>
              {saving
                ? 'Procesando...'
                : isEditingClient
                  ? 'Guardar Cambios'
                  : 'Registrar Cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL MASCOTAS ================= */}

      <Modal
        isOpen={isPetManagerOpen}
        onClose={() => setIsPetManagerOpen(false)}
        title={
          selectedClient
            ? `Pacientes de: ${selectedClient.nombres}`
            : 'Mascotas'
        }
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 gap-3">
            <p className="font-body text-sm text-on-surface-variant">
              Administra el perfil básico y accede al historial médico.
            </p>

            <Button
              variant="secondary"
              onClick={openCreatePet}
              className="py-2 px-4 text-sm"
              disabled={!selectedClient}
            >
              <span className="material-symbols-outlined text-[18px]">
                add
              </span>
              Agregar Mascota
            </Button>
          </div>

          {loadingPets ? (
            <div className="text-center py-10 text-on-surface-variant">
              Cargando mascotas...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedClient &&
                getClientPets(selectedClient.idUsuario).map((pet) => (
                  <div
                    key={`${pet.id_mascota}-${pet.id_cliente}`}
                    className="bg-white border border-outline-variant/30 p-5 rounded-2xl shadow-sm flex flex-col relative group"
                  >
                    <div className="absolute top-4 right-4 flex gap-1">
                      <button
                        onClick={() => openEditPet(pet)}
                        className="p-1.5 bg-tertiary-container/30 text-tertiary rounded-md hover:bg-tertiary-container/50"
                        title="Editar mascota"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </button>

                    </div>

                    <div className="flex items-center gap-3 mb-4 pr-16">
                      <div className="w-14 h-14 bg-primary-container/20 rounded-full flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-3xl">
                          cruelty_free
                        </span>
                      </div>

                      <div>
                        <h5 className="font-display text-xl font-bold text-on-surface">
                          {pet.nombre}
                        </h5>

                        <p className="font-body text-sm text-on-surface-variant">
                          {pet.tipo} • {pet.raza}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-body text-on-surface-variant bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 mb-4">
                      <p>
                        <strong>Edad:</strong>{' '}
                        {pet.edad != null ? `${pet.edad} años` : 'No registrada'}
                      </p>

                      <p>
                        <strong>Peso:</strong>{' '}
                        {pet.peso != null ? `${pet.peso} kg` : 'No registrado'}
                      </p>

                      <p>
                        <strong>Altura:</strong>{' '}
                        {pet.altura != null ? `${pet.altura} cm` : 'No registrada'}
                      </p>

                      <p>
                        <strong>Género:</strong> {pet.genero || 'No registrado'}
                      </p>

                      <p className="col-span-2 text-error">
                        <strong>Alergias:</strong> {pet.alergias || 'No registradas'}
                      </p>
                    </div>

                    <button
                      onClick={() => navigateToClinicalHistory(pet)}
                      className="w-full mt-auto bg-surface-container hover:bg-primary-container hover:text-primary-dark text-on-surface font-body text-sm font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-outline-variant/30 hover:border-primary/30"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        medical_information
                      </span>
                      Abrir Historial Clínico
                    </button>
                  </div>
                ))}

              {selectedClient &&
                getClientPets(selectedClient.idUsuario).length === 0 && (
                  <div className="col-span-full text-center py-10 text-on-surface-variant">
                    Este cliente todavía no tiene mascotas registradas.
                  </div>
                )}
            </div>
          )}
        </div>
      </Modal>

      {/* ================= MODAL FORMULARIO MASCOTA ================= */}

      <Modal
        isOpen={isPetFormModalOpen}
        onClose={() => setIsPetFormModalOpen(false)}
        title={isEditingPet ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handlePetSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nombre de Mascota:"
              icon="sound_detection_dog_barking"
              name="nombre"
              value={petForm.nombre}
              onChange={(e) =>
                setPetForm({ ...petForm, nombre: e.target.value })
              }
              required
            />

            <div className="space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">
                Especie / Tipo:
              </label>

              <select
                name="tipo"
                value={petForm.tipo}
                onChange={(e) =>
                  setPetForm({ ...petForm, tipo: e.target.value })
                }
                required
                className="w-full pl-3 pr-10 py-3.5 border border-outline-variant rounded-lg font-body text-sm bg-white focus:border-primary focus:ring-1 outline-none"
              >
                <option value="">Seleccionar...</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Exótico">Exótico</option>
              </select>
            </div>

            <InputField
              label="Raza:"
              icon="category"
              name="raza"
              value={petForm.raza}
              onChange={(e) =>
                setPetForm({ ...petForm, raza: e.target.value })
              }
              required
            />

            <InputField
              label="Edad (años):"
              icon="calendar_month"
              name="edad"
              type="number"
              value={petForm.edad}
              onChange={(e) =>
                setPetForm({ ...petForm, edad: e.target.value })
              }
              required
            />

            <InputField
              label="Peso (Kg):"
              icon="scale"
              name="peso"
              type="number"
              value={petForm.peso}
              onChange={(e) =>
                setPetForm({ ...petForm, peso: e.target.value })
              }
            />

            <InputField
              label="Altura (cm):"
              icon="height"
              name="altura"
              type="number"
              value={petForm.altura}
              onChange={(e) =>
                setPetForm({ ...petForm, altura: e.target.value })
              }
            />

            <div className="space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">
                Género:
              </label>

              <select
                value={petForm.genero}
                onChange={(e) =>
                  setPetForm({ ...petForm, genero: e.target.value })
                }
                className="w-full pl-3 pr-10 py-3.5 border border-outline-variant rounded-lg font-body text-sm bg-white focus:border-primary focus:ring-1 outline-none"
              >
                <option value="">No especificado</option>
                <option value="M">Macho</option>
                <option value="H">Hembra</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <InputField
                label="Alergias Conocidas:"
                icon="medical_information"
                name="alergias"
                placeholder="Escribir 'Ninguna' si no aplica"
                value={petForm.alergias}
                onChange={(e) =>
                  setPetForm({ ...petForm, alergias: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsPetFormModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button variant="secondary" type="submit" disabled={saving}>
              {saving
                ? 'Procesando...'
                : isEditingPet
                  ? 'Actualizar Mascota'
                  : 'Guardar Mascota'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL BAJA CLIENTE ================= */}

      <Modal
        isOpen={isDeleteClientModalOpen}
        onClose={() => setIsDeleteClientModalOpen(false)}
        title="Dar de baja al cliente"
        maxWidth="max-w-[480px]"
      >
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-start gap-5 mb-6 mt-2">
            <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[28px]">
                warning
              </span>
            </div>

            <div className="flex-1 text-left mt-1">
              <h4 className="font-display text-xl font-bold text-on-surface mb-2">
                ¿Estás seguro?
              </h4>

              <p className="font-body text-[15px] text-on-surface-variant w-full leading-relaxed">
                Se dará de baja la cuenta de{' '}
                <strong>
                  {selectedClient?.nombres} {selectedClient?.apPat}
                </strong>
                . La identidad quedará revocada y el historial de citas y
                mascotas se conservará.
              </p>
            </div>
          </div>

          <div className="flex flex-row justify-end gap-3 w-full pt-5 border-t border-outline-variant/20">
            <Button
              variant="outline"
              onClick={() => setIsDeleteClientModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button
              variant="action"
              onClick={confirmDeleteClient}
              disabled={saving}
              className="shadow-none px-6 bg-error border-error hover:bg-error/90"
            >
              {saving ? 'Procesando...' : 'Sí, dar de baja'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
