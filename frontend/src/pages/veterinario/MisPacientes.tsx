import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Cita {
  id_cita: string;
  fecha: string;
  hora: string;
  id_mascota: string;
  mascota_nombre?: string;
  id_cliente: string;
  cliente_nombre?: string;
}

interface Paciente {
  id_mascota: string;
  id_cliente: string;
  mascota_nombre: string;
  cliente_nombre: string;
  total_atenciones: number;
  ultima_atencion: string;
}

const MisPacientes: React.FC = () => {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  const cargarPacientes = async () => {
    try {
      setCargando(true);
      setError('');

      // Obtener las citas correspondientes al veterinario autenticado.
      const respuesta = await api.get('/citas/veterinario/agenda');
      const datos: Cita[] = Array.isArray(respuesta.data)
        ? respuesta.data
        : Array.isArray(respuesta.data?.citas)
          ? respuesta.data.citas
          : [];

      // Agrupar las citas por mascota y propietario.
      const agrupados = new Map<string, Paciente>();

      datos.forEach((cita) => {
        if (!cita.id_mascota || !cita.id_cliente) return;

        // Se utiliza una clave compuesta para evitar mezclar
        // mascotas con identificadores repetidos de distintos clientes.
        const clave = `${cita.id_mascota}_${cita.id_cliente}`;

        const existente = agrupados.get(clave);

        if (existente) {
          existente.total_atenciones += 1;

          if (
            cita.fecha &&
            (!existente.ultima_atencion ||
              cita.fecha > existente.ultima_atencion)
          ) {
            existente.ultima_atencion = cita.fecha;
          }
        } else {
          agrupados.set(clave, {
            id_mascota: String(cita.id_mascota),
            id_cliente: String(cita.id_cliente),
            mascota_nombre: cita.mascota_nombre || 'Nombre no disponible',
            cliente_nombre: cita.cliente_nombre || 'Propietario no disponible',
            total_atenciones: 1,
            ultima_atencion: cita.fecha || '',
          });
        }
      });

      // Ordenar por fecha de última atención.
      const resultado = Array.from(agrupados.values()).sort(
        (a, b) =>
          new Date(b.ultima_atencion).getTime() -
          new Date(a.ultima_atencion).getTime()
      );

      setPacientes(resultado);

    } catch (err: any) {
      console.error('Error al cargar pacientes del veterinario:', err);

      const mensaje = err?.response?.data?.message;

      setError(
        Array.isArray(mensaje)
          ? mensaje.join(', ')
          : mensaje || 'No se pudieron cargar tus pacientes.'
      );

    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();

    if (!termino) return pacientes;

    return pacientes.filter((paciente) => {
      const texto = [
        paciente.mascota_nombre,
        paciente.cliente_nombre,
        paciente.id_mascota,
        paciente.id_cliente,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return texto.includes(termino);
    });
  }, [pacientes, busqueda]);

  const formatoFecha = (fecha: string) => {
    if (!fecha) return 'Sin registro';

    const [anio, mes, dia] = fecha.slice(0, 10).split('-');

    return anio && mes && dia
      ? `${dia}/${mes}/${anio}`
      : fecha;
  };

  const abrirHistorial = (paciente: Paciente) => {
    navigate(
      `/veterinario/clinical-history/${encodeURIComponent(
        paciente.id_mascota
      )}?id_cliente=${encodeURIComponent(paciente.id_cliente)}`
    );
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* ENCABEZADO */}
      <header className="pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">
            Mis Pacientes
          </h2>

          <p className="font-body text-lg text-on-surface-variant">
            Consulta las mascotas que has atendido y accede a sus historiales clínicos.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarPacientes}
          disabled={cargando}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-5 py-3 rounded-xl shadow-sm font-bold text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] align-middle mr-2">
            refresh
          </span>
          Actualizar
        </button>
      </header>

      {/* CONTENEDOR */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-outline-variant/30 flex flex-col flex-1 overflow-hidden">

        {/* BUSCADOR Y CONTADOR */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between gap-4">

          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>

            <input
              type="text"
              placeholder="Buscar por mascota o propietario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-surface-container-low border-2 border-transparent text-on-surface text-sm pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center text-sm font-bold text-primary">
            {pacientes.length}{' '}
            {pacientes.length === 1 ? 'paciente registrado' : 'pacientes registrados'}
          </div>
        </div>

        {/* LISTADO */}
        <div className="flex-1 overflow-y-auto p-6">

          {cargando ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-3xl">
                progress_activity
              </span>

              <p className="mt-3">
                Consultando tus pacientes...
              </p>
            </div>

          ) : error ? (
            <div className="p-10 text-center">
              <span className="material-symbols-outlined text-error text-4xl">
                error
              </span>

              <p className="text-error font-bold mt-2">
                {error}
              </p>

              <button
                type="button"
                onClick={cargarPacientes}
                className="mt-4 px-5 py-2 bg-primary text-white rounded-lg font-bold"
              >
                Reintentar
              </button>
            </div>

          ) : pacientesFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-outline">
                pets
              </span>

              <h3 className="font-bold text-primary mt-3">
                {pacientes.length === 0
                  ? 'Todavía no tienes pacientes'
                  : 'No se encontraron coincidencias'}
              </h3>

              <p className="text-sm text-on-surface-variant mt-2">
                {pacientes.length === 0
                  ? 'Las mascotas que atiendas aparecerán en este apartado.'
                  : 'Intenta buscar utilizando otro nombre.'}
              </p>
            </div>

          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">

              {pacientesFiltrados.map((paciente) => (
                <article
                  key={`${paciente.id_mascota}_${paciente.id_cliente}`}
                  className="border border-outline-variant/40 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col"
                >

                  {/* ENCABEZADO DEL PACIENTE */}
                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-14 h-14 rounded-2xl bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl">
                        pets
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-primary truncate">
                        {paciente.mascota_nombre}
                      </h3>

                      <p className="text-xs text-on-surface-variant">
                        Paciente #{paciente.id_mascota}
                      </p>
                    </div>

                  </div>

                  {/* PROPIETARIO */}
                  <div className="bg-surface-container-low rounded-xl p-3 mb-3">

                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-lg">
                        person
                      </span>

                      <span className="text-xs font-bold uppercase">
                        Propietario
                      </span>
                    </div>

                    <p className="text-sm font-semibold mt-1">
                      {paciente.cliente_nombre}
                    </p>

                  </div>

                  {/* ESTADÍSTICAS */}
                  <div className="grid grid-cols-2 gap-3 mb-5">

                    <div className="bg-surface-container-low rounded-xl p-3">
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="material-symbols-outlined text-lg">
                          medical_services
                        </span>

                        <span className="text-xs font-bold">
                          Atenciones
                        </span>
                      </div>

                      <p className="text-xl font-bold text-on-surface">
                        {paciente.total_atenciones}
                      </p>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-3">
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="material-symbols-outlined text-lg">
                          calendar_month
                        </span>

                        <span className="text-xs font-bold">
                          Última visita
                        </span>
                      </div>

                      <p className="text-sm font-bold text-on-surface mt-1">
                        {formatoFecha(paciente.ultima_atencion)}
                      </p>
                    </div>

                  </div>

                  {/* ACCESO AL HISTORIAL */}
                  <div className="mt-auto pt-4 border-t border-outline-variant/30">

                    <button
                      type="button"
                      onClick={() => abrirHistorial(paciente)}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl py-3 font-bold text-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">
                        clinical_notes
                      </span>

                      Abrir historial clínico

                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </button>

                  </div>

                </article>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MisPacientes;