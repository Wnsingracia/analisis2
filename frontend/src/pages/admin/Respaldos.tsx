
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface ResultadoRespaldo {
  exitoso: boolean;
  nombre: string;
  fecha: string;
  ruta: string;
  tamanoBytes: number;
  mensaje: string;
}

interface Actividad {
  id: number;
  tipo: 'Local' | 'Google Drive';
  nombre: string;
  fecha: string;
  exitoso: boolean;
  tamanoBytes: number;
}

const mensajeError = (error: any, porDefecto: string) => {
  const msg = error?.response?.data?.message;
  return Array.isArray(msg) ? msg.join('\n') : msg ?? porDefecto;
};

const formatearBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null || !Number.isFinite(bytes)) {
    return 'No disponible';
  }

  if (bytes === 0) return '0 Bytes';

  const unidades = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const indice = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    unidades.length - 1
  );

  return `${(bytes / Math.pow(1024, indice)).toFixed(2)} ${unidades[indice]}`;
};

const formatearFecha = (fecha?: string) => {
  if (!fecha) return 'Fecha no disponible';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return fecha;

  return date.toLocaleString('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

export default function Respaldos() {
  const [aviso, setAviso] = useState<{
    tipo: 'ok' | 'error';
    texto: string;
  } | null>(null);

  const [trabajando, setTrabajando] = useState(false);

  const [operacionActual, setOperacionActual] = useState<
    'Local' | 'Google Drive' | null
  >(null);

  const [dosFactoresActivo, setDosFactoresActivo] = useState<boolean | null>(null);

  const [ultimoRespaldo, setUltimoRespaldo] =
    useState<ResultadoRespaldo | null>(null);

  const [actividades, setActividades] = useState<Actividad[]>([]);

  // Comprobar segundo factor
  useEffect(() => {
    let activo = true;

    api.get('/auth/2fa')
      .then(({ data }) => {
        if (activo) setDosFactoresActivo(!!data.activo);
      })
      .catch(() => {
        if (activo) setDosFactoresActivo(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const bloqueado = trabajando || dosFactoresActivo !== true;

  // Registrar actividad de la sesión
  const registrarActividad = (
    tipo: 'Local' | 'Google Drive',
    data: ResultadoRespaldo
  ) => {
    const nuevaActividad: Actividad = {
      id: Date.now(),
      tipo,
      nombre: data.nombre || 'Respaldo de base de datos',
      fecha: data.fecha || new Date().toISOString(),
      exitoso: data.exitoso !== false,
      tamanoBytes: data.tamanoBytes || 0
    };

    setActividades(prev => [nuevaActividad, ...prev].slice(0, 5));
    setUltimoRespaldo(data);
  };

  // Ejecutar operación
  const ejecutar = async (
    tipo: 'Local' | 'Google Drive',
    accion: () => Promise<void>
  ) => {
    if (bloqueado) return;

    setTrabajando(true);
    setOperacionActual(tipo);
    setAviso(null);

    try {
      await accion();
    } catch (error) {
      console.error('Error en operación de respaldo:', error);

      setAviso({
        tipo: 'error',
        texto: mensajeError(
          error,
          'No se pudo completar la operación de respaldo.'
        )
      });
    } finally {
      setTrabajando(false);
      setOperacionActual(null);
    }
  };

  // Respaldo local
  const generarLocal = () =>
    ejecutar('Local', async () => {
      const { data } = await api.post<ResultadoRespaldo>(
        '/respaldos/generar'
      );

      registrarActividad('Local', data);

      setAviso({
        tipo: 'ok',
        texto: data.mensaje ||
          `Respaldo local ${data.nombre} generado correctamente.`
      });
    });

  // Respaldo Google Drive
  const generarDrive = () =>
    ejecutar('Google Drive', async () => {
      const { data } = await api.post<ResultadoRespaldo>(
        '/respaldos/generar-drive'
      );

      registrarActividad('Google Drive', data);

      setAviso({
        tipo: 'ok',
        texto: data.mensaje ||
          'Respaldo subido a Google Drive correctamente.'
      });
    });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-[1400px] mx-auto">

      {/* ================= ENCABEZADO ================= */}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-2">
            <span className="material-symbols-outlined text-lg">
              database_backup
            </span>
            Administración del sistema
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
            Centro de respaldos
          </h1>

          <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
            Gestiona, genera y almacena copias de seguridad de la base de
            datos de VetCare para proteger la información del sistema.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-outline-variant/30 shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${
            dosFactoresActivo === true
              ? 'bg-green-500'
              : dosFactoresActivo === false
                ? 'bg-red-500'
                : 'bg-amber-400 animate-pulse'
          }`} />

          <span className="text-xs font-bold text-on-surface">
            {dosFactoresActivo === null
              ? 'Verificando seguridad'
              : dosFactoresActivo
                ? 'Seguridad habilitada'
                : 'Seguridad pendiente'}
          </span>
        </div>

      </header>

      {/* ================= TARJETAS DE ESTADO ================= */}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Seguridad */}
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-sm relative overflow-hidden">

          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Protección
              </p>

              <h3 className="text-xl font-bold text-on-surface mt-2">
                Autenticación 2FA
              </h3>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">
                shield_lock
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              dosFactoresActivo === true
                ? 'bg-green-50 text-green-700'
                : dosFactoresActivo === false
                  ? 'bg-red-50 text-red-700'
                  : 'bg-amber-50 text-amber-700'
            }`}>
              {dosFactoresActivo === null
                ? 'Comprobando...'
                : dosFactoresActivo
                  ? 'ACTIVADO'
                  : 'DESACTIVADO'}
            </span>

            <Link
              to="/admin/seguridad"
              className="text-xs font-bold text-primary hover:underline"
            >
              Configurar →
            </Link>
          </div>

        </div>
      </section>
            {/* ================= OPERACIONES ================= */}

      <section className="space-y-4">

        <div>
          <h2 className="font-display text-xl font-bold text-on-surface">
            Operaciones de respaldo
          </h2>

          <p className="text-sm text-on-surface-variant mt-1">
            Selecciona dónde deseas almacenar la copia de seguridad.
          </p>
        </div>

        {/* Aviso de seguridad */}
        {dosFactoresActivo === false && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 text-2xl">
              warning
            </span>

            <div className="flex-1">
              <p className="font-bold text-sm text-amber-900">
                Segundo factor no habilitado
              </p>

              <p className="text-xs text-amber-800 mt-1">
                Para proteger las copias de seguridad debes activar
                la autenticación en dos pasos.
              </p>

              <Link
                to="/admin/seguridad"
                className="inline-block mt-2 text-xs font-bold text-amber-900 underline"
              >
                Ir a configuración de seguridad →
              </Link>
            </div>
          </div>
        )}

        {dosFactoresActivo === null && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-700 animate-spin">
              progress_activity
            </span>

            <p className="text-sm text-blue-900">
              Comprobando los requisitos de seguridad...
            </p>
          </div>
        )}

        {/* Botones de respaldo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Respaldo local */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 flex flex-col">

            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">
                  save
                </span>
              </div>

            </div>

            <h3 className="font-display text-lg font-bold text-on-surface mt-5">
              Respaldo local
            </h3>

            <p className="text-sm text-on-surface-variant mt-2 flex-1">
              Genera una copia de seguridad de la base de datos y
              almacénala en el servidor de VetCare.
            </p>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-5 mb-5">
              <span className="material-symbols-outlined text-lg">
                computer
              </span>
              Almacenamiento del servidor
            </div>

            <button
              onClick={generarLocal}
              disabled={bloqueado}
              className="w-full py-3 px-4 rounded-xl bg-violet-700 text-white font-bold text-sm flex justify-center items-center gap-2 hover:bg-violet-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {trabajando && operacionActual === 'Local' ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Generando respaldo...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">
                    database
                  </span>
                  Generar respaldo local
                </>
              )}
            </button>

          </div>

          {/* Respaldo Drive */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 flex flex-col">

            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">
                  cloud_upload
                </span>
              </div>
            </div>

            <h3 className="font-display text-lg font-bold text-on-surface mt-5">
              Google Drive
            </h3>

            <p className="text-sm text-on-surface-variant mt-2 flex-1">
              Genera una copia de seguridad y envíala a tu repositorio
              configurado en Google Drive.
            </p>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-5 mb-5">
              <span className="material-symbols-outlined text-lg">
                cloud_done
              </span>
              Almacenamiento externo
            </div>

            <button
              onClick={generarDrive}
              disabled={bloqueado}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 text-white font-bold text-sm flex justify-center items-center gap-2 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {trabajando && operacionActual === 'Google Drive' ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Subiendo a Drive...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">
                    cloud_upload
                  </span>
                  Generar y subir a Drive
                </>
              )}
            </button>

          </div>

        </div>

        {/* Progreso */}
        {trabajando && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-700 animate-spin text-2xl">
                progress_activity
              </span>

              <div>
                <p className="font-bold text-sm text-blue-900">
                  {operacionActual === 'Local'
                    ? 'Generando copia de seguridad...'
                    : 'Generando y enviando a Google Drive...'}
                </p>

                <p className="text-xs text-blue-800 mt-1">
                  El servidor está procesando la solicitud. No cierres esta página.
                </p>
              </div>
            </div>

            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden mt-4">
              <div className="h-full w-1/3 bg-blue-600 rounded-full animate-pulse" />
            </div>

          </div>
        )}

        {/* Mensajes */}
        {aviso && (
          <div className={`rounded-xl border p-4 flex items-start gap-3 ${
            aviso.tipo === 'ok'
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>

            <span className="material-symbols-outlined text-2xl">
              {aviso.tipo === 'ok' ? 'check_circle' : 'error'}
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">
                {aviso.tipo === 'ok'
                  ? 'Operación completada'
                  : 'Error en el respaldo'}
              </p>

              <p className="text-sm mt-1 whitespace-pre-line break-words">
                {aviso.texto}
              </p>
            </div>

            <button
              onClick={() => setAviso(null)}
              className="opacity-60 hover:opacity-100"
              aria-label="Cerrar aviso"
            >
              <span className="material-symbols-outlined">
                close
              </span>
            </button>

          </div>
        )}

      </section>
      {/* ================= DIAGRAMA DE RESPALDO ================= */}
      <section className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-5 sm:p-7">

        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">
              account_tree
            </span>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">
              Arquitectura de respaldos
            </h2>

            <p className="text-xs text-on-surface-variant">
              Flujo de generación y almacenamiento de copias de seguridad
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">

          {/* Base de datos */}
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 text-center">

            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-lg">
              <span className="material-symbols-outlined text-4xl">
                database
              </span>
            </div>

            <h3 className="font-bold text-on-surface mt-3">
              Base de datos
            </h3>

            <p className="text-xs text-on-surface-variant mt-1">
              PostgreSQL · VetCare
            </p>

            <span className="inline-block mt-3 text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
              Origen de datos
            </span>

          </div>

          {/* Conexión */}
          <div className="flex flex-col items-center justify-center gap-1 py-2">
            <span className="material-symbols-outlined text-primary text-3xl rotate-90 md:rotate-0">
              arrow_forward
            </span>

            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              Generación
            </span>
          </div>

          {/* Destinos */}
          <div className="space-y-3">

            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 flex items-center gap-4">

              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">
                  hard_drive
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-sm text-violet-950">
                  Respaldo local
                </h3>

                <p className="text-xs text-violet-800 mt-1">
                  Almacenamiento en servidor
                </p>
              </div>

              <span className="material-symbols-outlined text-violet-600 ml-auto">
                check_circle
              </span>

            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-4">

              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">
                  cloud_upload
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-sm text-emerald-950">
                  Google Drive
                </h3>

                <p className="text-xs text-emerald-800 mt-1">
                  Almacenamiento en la nube
                </p>
              </div>

              <span className="material-symbols-outlined text-emerald-600 ml-auto">
                check_circle
              </span>

            </div>

          </div>

        </div>

        <div className="mt-5 bg-surface-container-low rounded-xl p-3 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary">
            info
          </span>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            El administrador puede generar copias de seguridad en cualquiera
            de los dos destinos. Ambos procesos requieren una verificación
            de identidad mediante el segundo factor.
          </p>
        </div>

      </section>

      {/* ================= PIE ================= */}

      <footer className="flex flex-col sm:flex-row justify-between items-center gap-2 py-4 border-t border-outline-variant/30">

        <p className="text-xs text-on-surface-variant">
          VetCare · Sistema de gestión veterinaria
        </p>

        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">
            security
          </span>
          Gestión segura de respaldos
        </div>

      </footer>

    </div>
  );
}
