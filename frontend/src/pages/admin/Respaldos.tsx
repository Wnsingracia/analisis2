import { useEffect, useState } from 'react';
import api from '../../services/api';

interface ResultadoRespaldo {
  exitoso: boolean;
  nombre: string;
  fecha: string;
  ruta: string;
  tamanoBytes: number;
  mensaje: string;
}

const mensajeError = (error: any, porDefecto: string) => {
  const msg = error?.response?.data?.message;
  return Array.isArray(msg) ? msg.join('\n') : msg ?? porDefecto;
};

export default function Respaldos() {
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const ejecutar = async (accion: () => Promise<void>) => {
    setTrabajando(true);
    setAviso(null);
    try {
      await accion();
    } catch (error) {
      setAviso({ tipo: 'error', texto: mensajeError(error, 'No se pudo completar la operación.') });
    } finally {
      setTrabajando(false);
    }
  };

  const generarLocal = () =>
    ejecutar(async () => {
      const { data } = await api.post<ResultadoRespaldo>('/respaldos/generar');
      setAviso({ tipo: 'ok', texto: data.mensaje || `Respaldo local ${data.nombre} generado correctamente.` });
    });

  const generarDrive = () =>
    ejecutar(async () => {
      const { data } = await api.post<ResultadoRespaldo>('/respaldos/generar-drive');
      setAviso({ tipo: 'ok', texto: data.mensaje || `Respaldo subido a Google Drive correctamente.` });
    });

  const btnCls = 'px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity';

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <header>
        <h2 className="font-display text-2xl font-bold text-primary">Gestión de Respaldos de Base de Datos</h2>
        <p className="font-body text-sm text-on-surface-variant">
          Panel exclusivo para administradores. Genera copias de seguridad bajo demanda en el servidor local o sincronízalas directamente en la nube en Google Drive.
        </p>
      </header>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-6 font-body text-sm">
        <div className="space-y-4">
          <h3 className="font-semibold text-base text-primary">Operaciones de respaldo</h3>
          <p className="text-xs text-on-surface-variant">
            Selecciona el tipo de copia de seguridad que deseas realizar sobre la base de datos de VetCare:
          </p>
          
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button className={btnCls} disabled={trabajando} onClick={generarLocal}>
              {trabajando ? 'Procesando...' : 'Generar respaldo local'}
            </button>

            <button className={`${btnCls} bg-emerald-700 hover:bg-emerald-800`} disabled={trabajando} onClick={generarDrive}>
              {trabajando ? 'Procesando...' : 'Subir copia a Google Drive'}
            </button>
          </div>
        </div>

        {aviso && (
          <div className={`p-4 rounded-xl text-sm ${aviso.tipo === 'ok' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-error border border-red-200'}`}>
            {aviso.texto}
          </div>
        )}
      </section>
    </div>
  );
}