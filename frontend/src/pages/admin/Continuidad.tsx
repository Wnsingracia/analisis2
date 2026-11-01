import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// Parte 5: estado del servicio y modo de operación (contención de incidentes)

type Modo = 'NORMAL' | 'EXPEDIENTES_CONGELADOS' | 'SOLO_LECTURA';

interface EstadoModo {
  modo: Modo;
  motivo: string | null;
  fecha: string | null;
}

const MODOS: { valor: Modo; titulo: string; detalle: string }[] = [
  { valor: 'NORMAL', titulo: 'Normal', detalle: 'Todo el sistema opera con normalidad.' },
  {
    valor: 'EXPEDIENTES_CONGELADOS',
    titulo: 'Expedientes congelados',
    detalle: 'Se bloquea crear, modificar o eliminar consultas, tratamientos y mascotas. Citas y clientes siguen.',
  },
  {
    valor: 'SOLO_LECTURA',
    titulo: 'Solo lectura',
    detalle: 'Se bloquea toda modificación, salvo la contención: suspender cuentas, cerrar sesiones, respaldos y cambiar de modo.',
  },
];

const color: Record<Modo, string> = {
  NORMAL: 'bg-green-100 text-green-800',
  EXPEDIENTES_CONGELADOS: 'bg-amber-100 text-amber-800',
  SOLO_LECTURA: 'bg-red-100 text-red-800',
};

const mensajeError = (error: any, porDefecto: string) => {
  const msg = error?.response?.data?.message;
  return Array.isArray(msg) ? msg.join('\n') : msg ?? porDefecto;
};

export default function Continuidad() {
  const [servicio, setServicio] = useState<'ok' | 'degradado' | null>(null);
  const [estado, setEstado] = useState<EstadoModo | null>(null);
  const [nuevoModo, setNuevoModo] = useState<Modo>('SOLO_LECTURA');
  const [motivo, setMotivo] = useState('');
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const comprobarServicio = async () => {
    try {
      await api.get('/health');
      setServicio('ok');
    } catch {
      setServicio('degradado');
    }
  };

  const cargarModo = async () => {
    try {
      const { data } = await api.get('/sistema/modo');
      setEstado(data);
    } catch {
      setEstado(null);
    }
  };

  useEffect(() => {
    comprobarServicio();
    cargarModo();
    const id = setInterval(comprobarServicio, 15000);
    return () => clearInterval(id);
  }, []);

  const aplicar = async () => {
    setTrabajando(true);
    setAviso(null);
    try {
      // Pide el código 2FA (api.ts abre el cuadro) y reintenta
      await api.put('/sistema/modo', { modo: nuevoModo, motivo: motivo.trim() });
      setAviso({ tipo: 'ok', texto: `Modo cambiado a ${nuevoModo}.` });
      setMotivo('');
      await cargarModo();
    } catch (error) {
      setAviso({ tipo: 'error', texto: mensajeError(error, 'No se pudo cambiar el modo.') });
    } finally {
      setTrabajando(false);
    }
  };

  const puedeAplicar = !trabajando && motivo.trim().length >= 3 && nuevoModo !== estado?.modo;

  return (
    <div className="p-8 space-y-8 max-w-3xl font-body text-sm">
      <header>
        <h2 className="font-display text-2xl font-bold text-primary">Continuidad y contención</h2>
        <p className="text-on-surface-variant">
          Estado del servicio de identidad y modo de operación del sistema ante un incidente.
        </p>
      </header>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Servicio de identidad (base de datos):</span>
          <span
            className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
              servicio === 'ok' ? 'bg-green-100 text-green-800' : servicio === 'degradado' ? 'bg-red-100 text-red-800' : 'bg-surface-variant'
            }`}
          >
            {servicio === 'ok' ? 'DISPONIBLE' : servicio === 'degradado' ? 'NO DISPONIBLE' : 'comprobando…'}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">Se comprueba cada 15 segundos con el punto de salud del servidor.</p>
      </section>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Modo actual:</span>
          {estado ? (
            <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${color[estado.modo]}`}>{estado.modo}</span>
          ) : (
            <span>…</span>
          )}
        </div>
        {estado?.motivo && (
          <p className="text-on-surface-variant">
            Motivo: {estado.motivo}
            {estado.fecha ? ` (${new Date(estado.fecha).toLocaleString()})` : ''}
          </p>
        )}

        <ul className="space-y-1 text-on-surface-variant">
          {MODOS.map((m) => (
            <li key={m.valor}>
              <strong>{m.titulo}:</strong> {m.detalle}
            </li>
          ))}
        </ul>

        <div className="grid gap-3 max-w-md">
          <label className="block">
            <span className="text-on-surface-variant">Cambiar a</span>
            <select
              value={nuevoModo}
              onChange={(e) => setNuevoModo(e.target.value as Modo)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-white"
            >
              {MODOS.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.titulo}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-on-surface-variant">Motivo (obligatorio)</span>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-white"
            />
          </label>
          <div>
            <button
              onClick={aplicar}
              disabled={!puedeAplicar}
              className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-40"
            >
              {trabajando ? 'Aplicando…' : 'Aplicar modo (pide 2FA)'}
            </button>
          </div>
        </div>

        {aviso && (
          <p className={aviso.tipo === 'ok' ? 'text-green-700' : 'text-error'}>{aviso.texto}</p>
        )}
        <p className="text-xs text-on-surface-variant">
          Los respaldos están en <Link to="/admin/respaldos" className="underline">Respaldos</Link> y los eventos en la
          auditoría de <Link to="/admin/identidades" className="underline">Identidades</Link>.
        </p>
      </section>
    </div>
  );
}
