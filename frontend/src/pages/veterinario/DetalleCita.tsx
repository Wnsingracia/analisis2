
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

interface Cita {
  id_cita: string;
  id_cons_medica: string; // Identificador de la consulta médica
  fecha: string;
  hora: string;
  tipo: string;
  cita_descripcion?: string;
  id_mascota: string;
  mascota_nombre?: string;
  mascota_tipo?: string;
  mascota_raza?: string;
  mascota_edad?: number | string;
  mascota_peso?: number | string;
  mascota_alergias?: string;
  mascota_genero?: string;
  id_cliente: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_correo?: string;
  id_tratamiento?: string | null;
  tratamiento_descripcion?: string | null;
  fecha_emision?: string | null;
}

const DetalleCita: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cita, setCita] = useState<Cita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [descripcionTratamiento, setDescripcionTratamiento] = useState('');
  const [guardandoTratamiento, setGuardandoTratamiento] = useState(false);
  const [errorTratamiento, setErrorTratamiento] = useState('');
  const [exitoTratamiento, setExitoTratamiento] = useState('');

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        setCargando(true);
        setError('');

        const respuesta = await api.get(
          `/citas/veterinario/${id}`
        );

        setCita(respuesta.data?.cita || respuesta.data);
      } catch (err: any) {
        console.error('Error al consultar detalle de cita:', err);

        setError(
          err?.response?.data?.message ||
          'No se pudo obtener la información de esta cita.'
        );
      } finally {
        setCargando(false);
      }
    };

    if (id) cargarDetalle();
  }, [id]);
  
  const agregarTratamiento = async () => {
    if (!cita?.id_cons_medica) {
      setErrorTratamiento(
        'No se encontró la consulta médica asociada a esta cita.'
      );
      return;
    }

    const descripcion = descripcionTratamiento.trim();

    if (!descripcion) {
      setErrorTratamiento('Ingresa la descripción del tratamiento.');
      return;
    }

    if (guardandoTratamiento) return;

    try {
      setGuardandoTratamiento(true);
      setErrorTratamiento('');
      setExitoTratamiento('');

      const respuesta = await api.post('/tratamientos', {
        descripcion,
        id_cons_medica: cita.id_cons_medica,
      });

      const nuevoTratamiento =
        respuesta.data?.tratamiento ?? respuesta.data;

      setCita((anterior) => {
        if (!anterior) return anterior;

        return {
          ...anterior,
          id_tratamiento: nuevoTratamiento.id_tratamiento,
          tratamiento_descripcion: nuevoTratamiento.descripcion,
          fecha_emision: nuevoTratamiento.fecha_emision,
        };
      });

      setDescripcionTratamiento('');
      setExitoTratamiento('Tratamiento registrado correctamente.');

    } catch (err: any) {
      console.error('Error al registrar tratamiento:', err);

      const mensaje = err?.response?.data?.message;

      setErrorTratamiento(
        Array.isArray(mensaje)
          ? mensaje.join(', ')
          : mensaje || 'No se pudo registrar el tratamiento.'
      );

    } finally {
      setGuardandoTratamiento(false);
    }
  };


  const formatoFecha = (fecha?: string) => {
    if (!fecha) return 'No especificada';

    const [anio, mes, dia] = fecha.slice(0, 10).split('-');

    return anio && mes && dia
      ? `${dia}/${mes}/${anio}`
      : fecha;
  };


  const InfoItem = ({
    titulo,
    valor,
    icono,
  }: {
    titulo: string;
    valor?: string | number | null;
    icono: string;
  }) => (
    <div className="flex gap-3 items-start">
      <div className="w-10 h-10 rounded-xl bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined">{icono}</span>
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold text-on-surface-variant uppercase">
          {titulo}
        </p>
        <p className="text-sm font-semibold text-on-surface mt-1 break-words">
          {valor || 'No registrado'}
        </p>
      </div>
    </div>
  );

  if (cargando) {
    return (
      <div className="p-12 text-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
        <p className="mt-3 text-on-surface-variant">
          Consultando información de la cita...
        </p>
      </div>
    );
  }

  if (error || !cita) {
    return (
      <div className="p-10 text-center">
        <span className="material-symbols-outlined text-error text-5xl">
          error
        </span>

        <h2 className="text-xl font-bold text-primary mt-3">
          No se pudo cargar la cita
        </h2>

        <p className="text-sm text-error mt-2">
          {error || 'La cita solicitada no está disponible.'}
        </p>

        <button
          onClick={() => navigate('/veterinario/citas')}
          className="mt-6 px-5 py-3 bg-primary text-white rounded-xl font-bold"
        >
          Volver a mis citas
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ENCABEZADO */}
      <header>
        <button
          onClick={() => navigate('/veterinario/citas')}
          className="flex items-center gap-2 text-primary font-bold text-sm hover:underline mb-5"
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
          Volver a mis citas
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl text-primary font-bold tracking-tight">
              Detalle de la Cita
            </h2>

            <p className="text-on-surface-variant mt-2">
              Información completa de la atención veterinaria.
            </p>
          </div>

          <span className="px-4 py-2 rounded-xl bg-primary-container/40 text-primary font-bold text-sm">
            Cita #{cita.id_cita}
          </span>
        </div>
      </header>

      {/* INFORMACIÓN GENERAL */}
      <section className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm p-6">

        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-2xl">
            calendar_month
          </span>

          <h3 className="text-xl font-bold text-primary">
            Información de la cita
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem
            titulo="Fecha"
            valor={formatoFecha(cita.fecha)}
            icono="event"
          />

          <InfoItem
            titulo="Hora"
            valor={cita.hora}
            icono="schedule"
          />

          <InfoItem
            titulo="Tipo de cita"
            valor={cita.tipo}
            icono="medical_services"
          />


          <InfoItem
            titulo="Identificador"
            valor={cita.id_cita}
            icono="tag"
          />
        </div>

        <div className="mt-6 pt-5 border-t border-outline-variant/30">
          <p className="text-xs uppercase font-bold text-on-surface-variant mb-2">
            Descripción de la cita
          </p>

          <p className="text-sm text-on-surface leading-relaxed">
            {cita.cita_descripcion || 'Sin descripción registrada.'}
          </p>
        </div>
      </section>

      {/* INFORMACIÓN DEL PACIENTE */}
      <section className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm p-6">

        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-2xl">
            pets
          </span>

          <h3 className="text-xl font-bold text-primary">
            Información del paciente
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem
            titulo="Nombre"
            valor={cita.mascota_nombre}
            icono="pets"
          />

          <InfoItem
            titulo="Tipo de animal"
            valor={cita.mascota_tipo}
            icono="category"
          />

          <InfoItem
            titulo="Raza"
            valor={cita.mascota_raza}
            icono="info"
          />

          <InfoItem
            titulo="Edad"
            valor={cita.mascota_edad != null ? `${cita.mascota_edad}` : undefined}
            icono="cake"
          />

          <InfoItem
            titulo="Peso"
            valor={cita.mascota_peso != null ? `${cita.mascota_peso} kg` : undefined}
            icono="monitor_weight"
          />

          <InfoItem
            titulo="Género"
            valor={cita.mascota_genero}
            icono="wc"
          />
        </div>

        <div className="mt-6 pt-5 border-t border-outline-variant/30">
          <p className="text-xs uppercase font-bold text-on-surface-variant mb-2">
            Alergias registradas
          </p>

          <p className="text-sm text-on-surface">
            {cita.mascota_alergias || 'No se registraron alergias.'}
          </p>
        </div>
      </section>

      {/* INFORMACIÓN DEL PROPIETARIO */}
      <section className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm p-6">

        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-2xl">
            person
          </span>

          <h3 className="text-xl font-bold text-primary">
            Datos del propietario
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem
            titulo="Nombre del propietario"
            valor={cita.cliente_nombre}
            icono="person"
          />

          <InfoItem
            titulo="Teléfono"
            valor={cita.cliente_telefono}
            icono="call"
          />

          <InfoItem
            titulo="Correo electrónico"
            valor={cita.cliente_correo}
            icono="mail"
          />
        </div>
      </section>


      {/* TRATAMIENTO */}
      <section className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm p-6">

        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-2xl">
            clinical_notes
          </span>

          <h3 className="text-xl font-bold text-primary">
            Tratamiento clínico
          </h3>
        </div>

        {cita.id_tratamiento ? (
          <div className="bg-surface-container-low rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-green-600">
                check_circle
              </span>

              <p className="text-sm font-bold text-green-700">
                Tratamiento registrado
              </p>
            </div>

            <p className="text-xs uppercase font-bold text-on-surface-variant">
              Descripción del tratamiento
            </p>

            <p className="text-sm text-on-surface mt-2 leading-relaxed whitespace-pre-wrap">
              {cita.tratamiento_descripcion || 'Sin descripción disponible.'}
            </p>

            <p className="text-xs text-on-surface-variant mt-4">
              Fecha de emisión: {formatoFecha(cita.fecha_emision || '')}
            </p>

          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">
                add_circle
              </span>

              <p className="font-bold text-primary">
                Registrar nuevo tratamiento
              </p>
            </div>

            <p className="text-sm text-on-surface-variant mb-4">
              Registra las indicaciones o el tratamiento clínico correspondiente
              a esta consulta.
            </p>

            <label
              htmlFor="descripcionTratamiento"
              className="block text-xs font-bold text-on-surface-variant uppercase mb-2"
            >
              Descripción del tratamiento
            </label>

            <textarea
              id="descripcionTratamiento"
              value={descripcionTratamiento}
              onChange={(e) => {
                setDescripcionTratamiento(e.target.value);
                setErrorTratamiento('');
                setExitoTratamiento('');
              }}
              maxLength={1000}
              rows={5}
              placeholder="Describe el tratamiento, indicaciones y recomendaciones..."
              disabled={guardandoTratamiento}
              className="w-full resize-y rounded-xl border border-outline-variant/50 bg-white p-4 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
            />

            <div className="flex justify-end mt-2">
              <p className="text-xs text-on-surface-variant">
                {descripcionTratamiento.length}/1000 caracteres
              </p>
            </div>

            {errorTratamiento && (
              <div className="mt-4 p-3 rounded-xl bg-error-container/20 text-error flex items-start gap-2">
                <span className="material-symbols-outlined text-lg">
                  error
                </span>
                <p className="text-sm font-medium">{errorTratamiento}</p>
              </div>
            )}

            {exitoTratamiento && (
              <div className="mt-4 p-3 rounded-xl bg-green-50 text-green-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-lg">
                  check_circle
                </span>
                <p className="text-sm font-medium">{exitoTratamiento}</p>
              </div>
            )}

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={agregarTratamiento}
                disabled={guardandoTratamiento || !descripcionTratamiento.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={`material-symbols-outlined text-xl ${
                  guardandoTratamiento ? 'animate-spin' : ''
                }`}>
                  {guardandoTratamiento ? 'progress_activity' : 'save'}
                </span>

                {guardandoTratamiento
                  ? 'Registrando tratamiento...'
                  : 'Registrar tratamiento'}
              </button>
            </div>

          </div>
        )}

      </section>



    </div>
  );
};

export default DetalleCita;
