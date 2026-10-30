import { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import api from '../../services/api';

// Parte 1: ciclo de vida de las identidades (estado, baja lógica, cambio de rol) y su auditoría

type Estado = 'ACTIVA' | 'SUSPENDIDA' | 'REVOCADA';

interface Identidad {
  id_usuario: number;
  nombres: string;
  ap_pat: string;
  correo: string;
  tipo_usuario: string;
  estado: Estado;
  es_emergencia?: boolean;
  motivo_estado: string | null;
  fecha_estado: string | null;
}

interface EventoAuditoria {
  id_evento: string;
  fecha: string;
  id_usuario: string | null;
  rol: string | null;
  evento: string;
  recurso: string | null;
  resultado: string;
  detalle: Record<string, unknown> | null;
}

const ROLES_PERSONAL = ['ADMIN', 'VETERINARIO', 'ESTILISTA', 'RECEPCIONISTA'];

const colorEstado: Record<Estado, string> = {
  ACTIVA: 'bg-green-100 text-green-800',
  SUSPENDIDA: 'bg-amber-100 text-amber-800',
  REVOCADA: 'bg-red-100 text-red-800',
};

type Accion =
  | { tipo: 'estado'; usuario: Identidad; estado: Estado }
  | { tipo: 'rol'; usuario: Identidad };

export default function Identidades() {
  const [usuarios, setUsuarios] = useState<Identidad[]>([]);
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('');
  const [accion, setAccion] = useState<Accion | null>(null);
  const [motivo, setMotivo] = useState('');
  const [rolDestino, setRolDestino] = useState('VETERINARIO');
  const [extra, setExtra] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    try {
      const [u, a] = await Promise.all([api.get('/usuarios'), api.get('/auditoria?limite=200')]);
      setUsuarios(u.data);
      setEventos(a.data);
    } catch (error) {
      console.error('Error al cargar identidades:', error);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrir = (a: Accion) => {
    setAccion(a);
    setMotivo('');
    setExtra('');
    setRolDestino(a.tipo === 'rol' ? ROLES_PERSONAL.find((r) => r !== a.usuario.tipo_usuario) ?? 'VETERINARIO' : 'VETERINARIO');
  };

  const confirmar = async () => {
    if (!accion) return;
    setEnviando(true);
    try {
      if (accion.tipo === 'estado') {
        await api.patch(`/usuarios/${accion.usuario.id_usuario}/estado`, {
          estado: accion.estado,
          motivo: motivo.trim() || undefined,
        });
      } else {
        // El campo extra se interpreta según el rol de destino
        const campoPorRol: Record<string, string> = {
          VETERINARIO: 'especializacion',
          ESTILISTA: 'rol',
          RECEPCIONISTA: 'departamento',
          ADMIN: 'nvl_acceso',
        };
        await api.patch(`/usuarios/${accion.usuario.id_usuario}/rol`, {
          tipo_usuario: rolDestino,
          motivo: motivo.trim(),
          ...(extra.trim() ? { [campoPorRol[rolDestino]]: extra.trim() } : {}),
        });
      }
      setAccion(null);
      await cargar();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join('\n') : msg ?? 'No se pudo completar la operación.');
    } finally {
      setEnviando(false);
    }
  };

  // Parte 2-d: cierra todas las sesiones abiertas de una cuenta (pide 2.º factor)
  const revocarSesiones = async (u: Identidad) => {
    if (!window.confirm(`¿Cerrar todas las sesiones abiertas de ${u.nombres} ${u.ap_pat}?`)) return;
    try {
      const { data } = await api.post(`/usuarios/${u.id_usuario}/revocar-sesiones`);
      alert(data.mensaje);
      await cargar();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join('\n') : msg ?? 'No se pudieron cerrar las sesiones.');
    }
  };

  const filtrados = usuarios.filter((u) =>
    `${u.nombres} ${u.ap_pat} ${u.correo} ${u.tipo_usuario}`.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const titulo =
    accion?.tipo === 'rol'
      ? `Cambiar rol de ${accion.usuario.nombres}`
      : accion
        ? `${accion.estado === 'ACTIVA' ? 'Reactivar' : accion.estado === 'SUSPENDIDA' ? 'Suspender' : 'Revocar'} a ${accion.usuario.nombres}`
        : '';

  const puedeEnviar =
    !!accion &&
    !enviando &&
    (accion.tipo === 'rol' ? motivo.trim().length >= 3 : (accion.estado === 'ACTIVA' && !accion.usuario.es_emergencia) || motivo.trim().length >= 3);

  const btn = 'px-3 py-1 rounded-full text-xs font-semibold border border-outline-variant/50 hover:bg-surface-variant/50 transition-colors';

  return (
    <div className="p-8 space-y-10">
      <header>
        <h2 className="font-display text-2xl font-bold text-primary">Identidades y ciclo de vida</h2>
        <p className="font-body text-sm text-on-surface-variant">
          Suspende, reactiva o revoca cuentas y cambia la función del personal. Cada cambio queda auditado.
        </p>
      </header>

      <section className="space-y-3">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, correo o rol"
          className="w-full max-w-md px-4 py-2 rounded-xl border border-outline-variant/50 bg-white font-body text-sm"
        />
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
          <table className="w-full text-sm font-body">
            <thead className="text-left text-on-surface-variant bg-surface-container-low">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Correo</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id_usuario} className="border-t border-outline-variant/20">
                  <td className="p-3">{u.id_usuario}</td>
                  <td className="p-3">{u.nombres} {u.ap_pat}</td>
                  <td className="p-3">{u.correo}</td>
                  <td className="p-3">{u.tipo_usuario}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorEstado[u.estado] ?? ''}`} title={u.motivo_estado ?? ''}>
                      {u.estado}
                    </span>
                    {u.es_emergencia && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800" title="Cuenta de emergencia (break-glass)">
                        EMERGENCIA
                      </span>
                    )}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    {u.estado === 'ACTIVA' && (
                      <button className={btn} onClick={() => abrir({ tipo: 'estado', usuario: u, estado: 'SUSPENDIDA' })}>Suspender</button>
                    )}
                    {u.estado === 'SUSPENDIDA' && (
                      <button className={btn} onClick={() => abrir({ tipo: 'estado', usuario: u, estado: 'ACTIVA' })}>Reactivar</button>
                    )}
                    {u.estado !== 'REVOCADA' && (
                      <button className={`${btn} text-error`} onClick={() => abrir({ tipo: 'estado', usuario: u, estado: 'REVOCADA' })}>Revocar</button>
                    )}
                    {u.estado !== 'REVOCADA' && (
                      <button className={btn} onClick={() => revocarSesiones(u)}>Cerrar sesiones</button>
                    )}
                    {u.estado === 'ACTIVA' && u.tipo_usuario !== 'CLIENTE' && (
                      <button className={btn} onClick={() => abrir({ tipo: 'rol', usuario: u })}>Cambiar rol</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-bold text-primary">Registro de auditoría (últimos 200 eventos)</h3>
        <input
          value={filtroEvento}
          onChange={(e) => setFiltroEvento(e.target.value)}
          placeholder="Filtrar por evento (LOGIN, EMERGENCIA, ACCESO_DENEGADO, ELIMINAR…)"
          className="w-full max-w-md px-4 py-2 rounded-xl border border-outline-variant/50 bg-white font-body text-sm"
        />
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
          <table className="w-full text-xs font-body">
            <thead className="text-left text-on-surface-variant bg-surface-container-low">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Evento</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Recurso</th>
                <th className="p-3">Resultado</th>
                <th className="p-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {eventos
                .filter((e) => e.evento.toLowerCase().includes(filtroEvento.toLowerCase()))
                .map((e) => (
                <tr key={e.id_evento} className="border-t border-outline-variant/20 align-top">
                  <td className="p-3 whitespace-nowrap">{new Date(e.fecha).toLocaleString()}</td>
                  <td className="p-3 font-semibold">{e.evento}</td>
                  <td className="p-3">{e.id_usuario ? `${e.id_usuario} (${e.rol ?? '-'})` : 'sistema / público'}</td>
                  <td className="p-3">{e.recurso}</td>
                  <td className="p-3">{e.resultado}</td>
                  <td className="p-3 break-all">{e.detalle ? JSON.stringify(e.detalle) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={!!accion} onClose={() => setAccion(null)} title={titulo} maxWidth="max-w-[520px]">
        <div className="space-y-4 font-body text-sm">
          {accion?.tipo === 'rol' && (
            <>
              <label className="block">
                <span className="text-on-surface-variant">Nuevo rol</span>
                <select
                  value={rolDestino}
                  onChange={(e) => setRolDestino(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-white"
                >
                  {ROLES_PERSONAL.filter((r) => r !== accion.usuario.tipo_usuario).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-on-surface-variant">
                  {rolDestino === 'VETERINARIO' ? 'Especialización' : rolDestino === 'ESTILISTA' ? 'Especialidad' : rolDestino === 'RECEPCIONISTA' ? 'Departamento' : 'Nivel de acceso'} (opcional)
                </span>
                <input value={extra} onChange={(e) => setExtra(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-white" />
              </label>
            </>
          )}
          <label className="block">
            <span className="text-on-surface-variant">
              Motivo {accion?.tipo === 'estado' && accion.estado === 'ACTIVA' && !accion.usuario.es_emergencia ? '(opcional)' : '(obligatorio)'}
            </span>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-white"
            />
          </label>
          {accion?.tipo === 'estado' && accion.estado === 'REVOCADA' && (
            <p className="text-error text-xs">La revocación es definitiva: la identidad no podrá reactivarse. Su historial se conserva.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAccion(null)} className={btn}>Cancelar</button>
            <button
              disabled={!puedeEnviar}
              onClick={confirmar}
              className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-40"
            >
              {enviando ? 'Guardando…' : 'Confirmar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
