
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Cita {
  id_cita: string;
  fecha: string;
  hora: string;
  tipo: string;
  cita_descripcion?: string;
  costo: number | string;
  id_mascota: string;
  mascota_nombre?: string;
  id_cliente: string;
  cliente_nombre?: string;
  id_tratamiento?: string | null;
  tratamiento_descripcion?: string | null;
  fecha_emision?: string | null;
}

const mensajeError = (error: any) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  'No se pudieron cargar las citas asignadas.';

const MisCitasVeterinario: React.FC = () => {
  const navigate = useNavigate();

  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  const cargarCitas = async () => {
    try {
      setCargando(true);
      setError('');

      // El backend identifica al veterinario mediante el JWT.
      const respuesta = await api.get('/citas/veterinario/agenda');
      const datos = respuesta.data;

      setCitas(
        Array.isArray(datos)
          ? datos
          : Array.isArray(datos?.citas)
            ? datos.citas
            : []
      );
    } catch (err: any) {
      console.error('Error al cargar citas del veterinario:', err);
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const citasFiltradas = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();

    if (!termino) return citas;

    return citas.filter((cita) => {
      const texto = [
        cita.id_cita,
        cita.tipo,
        cita.cita_descripcion,
        cita.fecha,
        cita.hora,
        cita.mascota_nombre,
        cita.cliente_nombre,
        cita.tratamiento_descripcion,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return texto.includes(termino);
    });
  }, [citas, busqueda]);

  const formatoFecha = (fecha: string) => {
    if (!fecha) return 'Sin fecha';

    const [anio, mes, dia] = fecha.slice(0, 10).split('-');

    return anio && mes && dia
      ? `${dia}/${mes}/${anio}`
      : fecha;
  };

  const formatoCosto = (costo: number | string) => {
    const valor = Number(costo);

    return Number.isFinite(valor)
      ? `Bs. ${valor.toFixed(2)}`
      : 'No especificado';
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* ENCABEZADO */}
      <header className="pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">
            Mis Citas
          </h2>

          <p className="font-body text-lg text-on-surface-variant">
            Administra tus citas y consulta la información de tus pacientes.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarCitas}
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

        {/* BUSCADOR */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>

            <input
              type="text"
              placeholder="Buscar por mascota, cliente o fecha..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-surface-container-low border-2 border-transparent text-on-surface text-sm pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center text-sm font-bold text-primary">
            {citas.length} {citas.length === 1 ? 'cita asignada' : 'citas asignadas'}
          </div>
        </div>

        {/* LISTADO */}
        <div className="overflow-x-auto flex-1 p-6">

          {cargando ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-3xl">
                progress_activity
              </span>
              <p className="mt-3">Consultando tus citas...</p>
            </div>

          ) : error ? (
            <div className="p-10 text-center">
              <span className="material-symbols-outlined text-error text-4xl">
                error
              </span>

              <p className="text-error font-bold mt-2">{error}</p>

              <button
                onClick={cargarCitas}
                className="mt-4 px-5 py-2 bg-primary text-white rounded-lg font-bold"
              >
                Reintentar
              </button>
            </div>

          ) : citasFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-outline">
                event_busy
              </span>

              <h3 className="font-bold text-primary mt-3">
                {citas.length === 0
                  ? 'No tienes citas asignadas'
                  : 'No se encontraron coincidencias'}
              </h3>

              <p className="text-sm text-on-surface-variant mt-2">
                {citas.length === 0
                  ? 'Las citas que te asignen aparecerán aquí.'
                  : 'Intenta buscar utilizando otros términos.'}
              </p>
            </div>

          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {citasFiltradas.map((cita) => (
                <article
                  key={cita.id_cita}
                  className="border border-outline-variant/40 rounded-2xl p-5 hover:shadow-md transition-shadow"
                >

                  {/* FECHA Y HORA */}
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-container/30 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">
                          calendar_month
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-on-surface">
                          {formatoFecha(cita.fecha)}
                        </p>

                        <p className="text-sm text-primary font-bold">
                          {cita.hora}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-lg">
                      #{cita.id_cita}
                    </span>
                  </div>

                  {/* TIPO DE CITA */}
                  <div className="mb-4">
                    <span className="inline-flex px-3 py-1 rounded-lg bg-secondary-container/40 text-secondary text-xs font-bold">
                      {cita.tipo || 'Consulta'}
                    </span>

                    <p className="text-sm text-on-surface mt-3 leading-relaxed">
                      {cita.cita_descripcion || 'Sin descripción registrada.'}
                    </p>
                  </div>

                  {/* PACIENTE */}
                  <div className="bg-surface-container-low rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined">
                        pets
                      </span>

                      <span className="text-xs font-bold uppercase">
                        Paciente
                      </span>
                    </div>

                    <p className="text-sm font-bold mt-1">
                      {cita.mascota_nombre || 'Nombre no disponible'}
                    </p>
                  </div>

                  {/* CLIENTE */}
                  <div className="bg-surface-container-low rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined">
                        person
                      </span>

                      <span className="text-xs font-bold uppercase">
                        Propietario
                      </span>
                    </div>

                    <p className="text-sm font-bold mt-1">
                      {cita.cliente_nombre || 'No disponible'}
                    </p>
                  </div>

                  {/* COSTO */}
                  <div className="flex justify-between items-center border-t border-outline-variant/30 pt-4">
                    <span className="text-sm text-on-surface-variant">
                      Costo registrado
                    </span>

                    <span className="text-lg font-bold text-primary">
                      {formatoCosto(cita.costo)}
                    </span>
                  </div>

                  {/* BOTÓN DETALLE */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/veterinario/citas/${cita.id_cita}`)
                    }
                    className="mt-5 w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl py-3 font-bold text-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">
                      visibility
                    </span>
                    Ver detalles de la cita
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  </button>

                </article>
              ))}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisCitasVeterinario;
