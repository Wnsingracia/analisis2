
import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ================= TIPOS DEL BACKEND =================

interface Mascota {
  id_mascota: string;
  id_cliente: string;
  nombre?: string | null;
  tipo?: string | null;
  raza?: string | null;
  edad?: number | string | null;
  peso?: number | null;
  altura?: number | null;
  alergias?: string | null;
  genero?: string | null;
  cliente?: {
    usuario?: {
      nombres?: string;
      ap_pat?: string;
      ap_mat?: string;
      cel?: string | number;
    };
  };
}

interface Consulta {
  id_cons_medica: string;
  fecha?: string | null;
  hora?: string | null;
  costo?: string | number | null;
  especialidad?: string | null;
  ambiente?: string | null;
  id_veterinario?: string | null;
  id_cita?: string | null;
  idMascota?: string | null;
  mascota?: {
    id_mascota?: string;
    id_cliente?: string;
  };
  veterinario?: {
    id_veterinario?: string;
  };
}

interface Tratamiento {
  id_tratamiento: string;
  descripcion?: string | null;
  fecha_emision?: string | null;
  id_cons_medica?: string | null;
}

interface ClienteApi {
  id_usuario: string;
  usuario?: {
    nombres?: string;
    ap_pat?: string;
    ap_mat?: string;
    cel?: string | number;
  };
}

const mensajeError = (error: any) =>
  error?.response?.data?.message ||
  error?.response?.data?.mensaje ||
  error?.message ||
  'No se pudieron cargar los datos del historial clínico.';

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return 'Sin registro';

  const partes = String(fecha).slice(0, 10).split('-');

  if (partes.length !== 3) return fecha;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const obtenerDia = (fecha?: string | null) => {
  if (!fecha) return '--';

  const partes = fecha.slice(0, 10).split('-');

  return partes.length === 3 ? partes[2] : '--';
};

const obtenerMesAnio = (fecha?: string | null) => {
  if (!fecha) return '';

  const partes = fecha.slice(0, 10).split('-');

  return partes.length === 3
    ? `${partes[1]}-${partes[0]}`
    : '';
};

export default function ClinicalHistory() {
  const [searchParams] = useSearchParams();

  const idCliente = searchParams.get('id_cliente');

  const { usuario } = useAuth();

  const esVeterinario =
    String(usuario?.tipo_usuario || '').toUpperCase() === 'VETERINARIO';

  const rutaVolver = esVeterinario
    ? '/veterinario/pacientes'
    : '/admin/clients';

  const textoVolver = esVeterinario
    ? 'Volver a Mis Pacientes'
    : 'Volver a Clientes y Mascotas';

  const { idMascota } = useParams<{ idMascota: string }>();

  // ================= ESTADOS =================

  const [pet, setPet] = useState<Mascota | null>(null);
  const [consultations, setConsultations] = useState<Consulta[]>([]);
  const [treatments, setTreatments] = useState<Tratamiento[]>([]);

  const [duenoNombre, setDuenoNombre] = useState('No disponible');
  const [duenoCel, setDuenoCel] = useState('Sin celular');

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // ================= CARGAR HISTORIAL =================

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!idMascota || !idCliente) {
        setErrorMessage(
          'No se recibió el identificador de la mascota o de su propietario.',
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const [mascotaRes, consultasRes, tratamientosRes, clientesRes] =
          await Promise.all([
            api.get(`/mascotas/${idMascota}`, {
              params: { id_cliente: idCliente },
            }),
            api.get('/consultas'),
            api.get('/tratamientos'),
            api.get('/clientes').catch(() => ({ data: [] })),
          ]);

        const mascota: Mascota = mascotaRes.data;

        if (
          String(mascota.id_mascota) !== String(idMascota) ||
          String(mascota.id_cliente) !== String(idCliente)
        ) {
          throw new Error(
            'La mascota obtenida no corresponde al propietario seleccionado.',
          );
        }

        setPet(mascota);

        // Datos del propietario.
        const clienteRelacionado = mascota.cliente?.usuario;

        const clientes: ClienteApi[] = Array.isArray(clientesRes.data)
          ? clientesRes.data
          : [];

        const clienteEncontrado = clientes.find(
          (cliente) => String(cliente.id_usuario) === String(idCliente),
        );

        const usuario = clienteRelacionado || clienteEncontrado?.usuario;
        

        if (usuario) {
          setDuenoNombre(
            [
              usuario.nombres,
              usuario.ap_pat,
              usuario.ap_mat,
            ]
              .filter(Boolean)
              .join(' ') || 'No disponible',
          );

          setDuenoCel(String(usuario.cel ?? 'Sin celular'));
        } else {
          setDuenoNombre(`Cliente #${idCliente}`);
          setDuenoCel('Sin celular');
        }

        // Consultas asociadas a la mascota.
        const todasLasConsultas: Consulta[] = Array.isArray(
          consultasRes.data,
        )
          ? consultasRes.data
          : [];

        const consultasMascota = todasLasConsultas.filter((consulta) => {
          const idMascotaConsulta =
            consulta.idMascota ??
            consulta.mascota?.id_mascota;

          const coincideMascota =
            String(idMascotaConsulta) === String(idMascota);

          // Si el backend devuelve la relación mascota con su propietario,
          // también comprobamos el ID del cliente.
          const idClienteConsulta = consulta.mascota?.id_cliente;

          const coincideCliente =
            idClienteConsulta == null ||
            String(idClienteConsulta) === String(idCliente);

          return coincideMascota && coincideCliente;
        });

        consultasMascota.sort((a, b) =>
          String(b.fecha || '').localeCompare(String(a.fecha || '')),
        );

        setConsultations(consultasMascota);

        // Tratamientos vinculados a las consultas encontradas.
        const todasLasTratamientos: Tratamiento[] = Array.isArray(
          tratamientosRes.data,
        )
          ? tratamientosRes.data
          : [];

        const idsConsultas = new Set(
          consultasMascota.map((consulta) =>
            String(consulta.id_cons_medica),
          ),
        );

        const tratamientosMascota = todasLasTratamientos.filter(
          (tratamiento) =>
            idsConsultas.has(String(tratamiento.id_cons_medica)),
        );

        setTreatments(tratamientosMascota);
      } catch (error: any) {
        setErrorMessage(mensajeError(error));
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, [idMascota, idCliente]);

  

  // ================= CARGA =================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl animate-spin mb-3">
          progress_activity
        </span>
        <p className="font-body text-sm">
          Cargando historial clínico...
        </p>
      </div>
    );
  }

  if (errorMessage || !pet) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <span className="material-symbols-outlined text-5xl text-error mb-3">
          error
        </span>

        <h3 className="font-display text-xl font-bold text-on-surface mb-2">
          No se pudo cargar el historial
        </h3>

        <p className="font-body text-sm text-error text-center max-w-lg mb-5">
          {errorMessage || 'No se encontró la mascota solicitada.'}
        </p>

        <Link
          to={rutaVolver}
          className="bg-primary text-white px-5 py-3 rounded-xl font-bold text-sm"
        >
          {textoVolver}
        </Link>
      </div>
    );
  }

  // ================= DATOS DERIVADOS =================

  const tratamientosDeConsulta = (idConsulta: string) =>
    treatments.filter(
      (tratamiento) =>
        String(tratamiento.id_cons_medica) === String(idConsulta),
    );

  const genero =
    pet.genero === 'M'
      ? 'Macho'
      : pet.genero === 'H' || pet.genero === 'F'
        ? 'Hembra'
        : 'No registrado';

  // ================= RENDER =================

  return (
    <div className="flex flex-col h-full relative overflow-y-auto">

      {/* ================= CABECERA ================= */}

      <header className="pb-6 flex flex-col gap-4 flex-shrink-0 border-b border-outline-variant/30 mb-6">

      <Link
        to={rutaVolver}
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-body text-sm font-bold w-fit transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        {textoVolver}
      </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

          <div>
            <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-1">
              Historial Clínico
            </h2>

            <p className="font-body text-lg text-on-surface-variant flex items-center gap-2">
              Paciente:
              <span className="font-bold text-on-surface">
                {pet.nombre || 'Sin nombre'}
              </span>

              <span className="bg-surface-container-high px-2 py-0.5 rounded-md text-xs">
                ID: #{pet.id_mascota}
              </span>
            </p>
          </div>

          <div className="bg-surface-container-low px-4 py-3 rounded-xl flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-primary">
              visibility
            </span>
            Consulta de historial
          </div>

        </div>
      </header>

      {/* ================= ESTRUCTURA DE 3 COLUMNAS ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">

        {/* --- COLUMNA 1: PERFIL --- */}

        <div className="lg:col-span-3 flex flex-col gap-6">

          <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 p-6 flex flex-col items-center text-center">

            <div className="w-24 h-24 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-4 border-4 border-surface">
              <span className="material-symbols-outlined text-5xl">
                cruelty_free
              </span>
            </div>

            <h3 className="font-display text-2xl font-bold text-on-surface">
              {pet.nombre || 'Sin nombre'}
            </h3>

            <p className="font-body text-sm text-on-surface-variant mb-4">
              {pet.tipo || 'Sin tipo'} • {pet.raza || 'Sin raza'}
            </p>

            <div className="w-full grid grid-cols-2 gap-2 text-left bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 font-body text-sm mb-4">

              <div>
                <span className="text-on-surface-variant text-xs block">
                  Edad
                </span>

                <span className="font-bold text-on-surface">
                  {pet.edad != null ? `${pet.edad} años` : 'No registrada'}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant text-xs block">
                  Género
                </span>

                <span className="font-bold text-on-surface">
                  {genero}
                </span>
              </div>

            </div>

            <div className="w-full pt-4 border-t border-outline-variant/30 text-left">

              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider block mb-1">
                Dueño Responsable
              </span>

              <p className="font-body text-sm font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">
                  person
                </span>
                {duenoNombre}
              </p>

              <p className="font-body text-xs text-on-surface-variant mt-0.5">
                {duenoCel}
              </p>

              <p className="font-body text-[11px] text-on-surface-variant mt-1">
                Cliente ID: #{pet.id_cliente}
              </p>

            </div>
          </div>

          {/* SIGNOS VITALES */}

          <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 overflow-hidden">

            <div className="bg-surface-container-lowest px-5 py-3 border-b border-outline-variant/30">
              <h4 className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Últimos Signos Vitales
              </h4>
            </div>

            <div className="p-5 flex flex-col gap-4">

              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-3 text-secondary">
                  <span className="material-symbols-outlined">height</span>
                  <span className="font-body text-sm text-on-surface-variant">
                    Altura
                  </span>
                </div>

                <span className="font-body font-bold text-on-surface">
                  {pet.altura != null ? `${pet.altura} cm` : 'No registrada'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-tertiary">
                  <span className="material-symbols-outlined">scale</span>
                  <span className="font-body text-sm text-on-surface-variant">
                    Peso
                  </span>
                </div>

                <span className="font-body font-bold text-on-surface">
                  {pet.peso != null ? `${pet.peso} kg` : 'No registrado'}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* --- COLUMNA 2: ALERGIAS Y TRATAMIENTOS --- */}

        <div className="lg:col-span-5 flex flex-col gap-6">

          <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 overflow-hidden flex flex-col h-full">

            <div className="bg-surface-container-lowest px-5 py-4 border-b border-outline-variant/30">
              <h4 className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-error">
                  coronavirus
                </span>
                Antecedentes & Alergias
              </h4>
            </div>

            <div className="p-6 flex-1">

              {pet.alergias &&
              pet.alergias.trim().toLowerCase() !== 'ninguna' ? (

                <div className="bg-error-container/20 border border-error/30 rounded-xl p-4 flex items-start gap-3">

                  <span className="material-symbols-outlined text-error shrink-0">
                    warning
                  </span>

                  <div>
                    <h5 className="font-body text-sm font-bold text-error mb-1">
                      Alergias Registradas:
                    </h5>

                    <p className="font-body text-sm text-on-surface-variant">
                      {pet.alergias}
                    </p>
                  </div>

                </div>

              ) : (

                <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-xl p-4 flex items-start gap-3">

                  <span className="material-symbols-outlined text-[#4CAF50] shrink-0">
                    check_circle
                  </span>

                  <div>
                    <h5 className="font-body text-sm font-bold text-[#4CAF50] mb-1">
                      Sin alergias conocidas
                    </h5>

                    <p className="font-body text-sm text-on-surface-variant">
                      Paciente sin reportes de reacciones adversas.
                    </p>
                  </div>

                </div>
              )}

              {/* TRATAMIENTOS */}

              <div className="mt-8">

                <h5 className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">
                  Tratamientos Activos / Previos
                </h5>

                {treatments.length > 0 ? (

                  <ul className="space-y-4">

                    {treatments.map((tratamiento) => (

                      <li
                        key={tratamiento.id_tratamiento}
                        className="flex gap-3 items-start"
                      >

                        <span className="material-symbols-outlined text-tertiary mt-0.5 text-[20px]">
                          vaccines
                        </span>

                        <div>
                          <p className="font-body text-sm font-bold text-on-surface">
                            {tratamiento.descripcion || 'Sin descripción'}
                          </p>

                          <p className="font-body text-xs text-on-surface-variant mt-0.5">
                            Emitido: {formatearFecha(tratamiento.fecha_emision)}
                            {' | '}
                            Cons. ID: #{tratamiento.id_cons_medica}
                          </p>
                        </div>

                      </li>

                    ))}

                  </ul>

                ) : (

                  <div className="text-center py-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl mb-2">
                      medical_information
                    </span>

                    <p className="font-body text-sm">
                      No existen tratamientos registrados para esta mascota.
                    </p>
                  </div>

                )}

              </div>

            </div>
          </div>

        </div>

        {/* --- COLUMNA 3: CONSULTAS --- */}

        <div className="lg:col-span-4 flex flex-col gap-6">

          <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 overflow-hidden flex flex-col h-full">

            <div className="bg-surface-container-lowest px-5 py-4 border-b border-outline-variant/30 flex justify-between items-center">

              <h4 className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  local_hospital
                </span>
                Consultas Médicas
              </h4>

              <span className="bg-primary-container/20 text-primary px-2 py-1 rounded-full text-xs font-bold">
                {consultations.length}
              </span>

            </div>

            <div className="p-0 overflow-y-auto max-h-[600px] divide-y divide-outline-variant/20">

              {consultations.length > 0 ? (

                consultations.map((consulta) => {

                  const tratamientos = tratamientosDeConsulta(
                    consulta.id_cons_medica,
                  );

                  return (

                    <div
                      key={consulta.id_cons_medica}
                      className="p-5 hover:bg-surface-container-lowest/50 transition-colors border-l-4 border-transparent hover:border-primary"
                    >

                      <div className="flex justify-between items-start mb-2">

                        <div className="bg-primary-container/20 text-primary px-2 py-1 rounded-md text-center shrink-0 border border-primary/10">

                          <p className="font-display text-lg font-bold leading-none">
                            {obtenerDia(consulta.fecha)}
                          </p>

                          <p className="font-body text-[10px] font-bold uppercase mt-1">
                            {obtenerMesAnio(consulta.fecha)}
                          </p>

                        </div>

                        <div className="text-right">
                          <span className="font-body text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                            {consulta.hora || 'Sin hora'}
                          </span>
                        </div>

                      </div>

                      <div>

                        <h5 className="font-body text-sm font-bold text-on-surface mb-1">
                          {consulta.especialidad || 'Consulta médica'}
                        </h5>

                        <p className="font-body text-xs text-on-surface-variant mb-2">
                          Consulta #{consulta.id_cons_medica}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-on-surface-variant font-bold">

                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              stethoscope
                            </span>
                            Vet ID: #{consulta.id_veterinario || 'N/D'}
                          </span>

                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              meeting_room
                            </span>
                            {consulta.ambiente || 'Sin ambiente'}
                          </span>

                        </div>

                        {consulta.costo != null && (

                          <p className="font-body text-xs font-bold text-primary mt-3">
                            Costo: Bs. {consulta.costo}
                          </p>

                        )}

                        {tratamientos.length > 0 && (

                          <div className="mt-3 bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/20">

                            <p className="font-body text-[10px] font-bold text-on-surface-variant uppercase mb-2">
                              Tratamientos de esta consulta
                            </p>

                            {tratamientos.map((tratamiento) => (

                              <p
                                key={tratamiento.id_tratamiento}
                                className="font-body text-xs text-on-surface mb-1"
                              >
                                • {tratamiento.descripcion || 'Sin descripción'}
                              </p>

                            ))}

                          </div>

                        )}

                      </div>

                    </div>

                  );
                })

              ) : (

                <div className="flex flex-col items-center justify-center text-center py-12 px-5 text-on-surface-variant">

                  <span className="material-symbols-outlined text-4xl mb-3">
                    event_busy
                  </span>

                  <p className="font-body text-sm font-bold">
                    Sin consultas registradas
                  </p>

                  <p className="font-body text-xs mt-1">
                    Esta mascota todavía no tiene consultas médicas registradas.
                  </p>

                </div>

              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
