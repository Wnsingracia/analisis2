import { useEffect, useState } from 'react';
import api from '../../services/api';

// Parte 2-e: activar el segundo factor (TOTP) con una app autenticadora.
// Las operaciones de alto riesgo (suspender, revocar, cambiar roles, borrar...) lo exigirán.

interface Configuracion {
  secreto: string;
  otpauth_uri: string;
}

const mensajeError = (error: any, porDefecto: string) => {
  const msg = error?.response?.data?.message;
  return Array.isArray(msg) ? msg.join('\n') : msg ?? porDefecto;
};

export default function Seguridad() {
  const [activo, setActivo] = useState<boolean | null>(null);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [codigo, setCodigo] = useState('');
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const cargar = async () => {
    try {
      const { data } = await api.get('/auth/2fa');
      setActivo(data.activo);
    } catch {
      setActivo(null);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

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

  const generar = () =>
    ejecutar(async () => {
      const { data } = await api.post('/auth/2fa/configurar');
      setConfig(data);
      setCodigo('');
    });

  const confirmarActivacion = () =>
    ejecutar(async () => {
      const { data } = await api.post('/auth/2fa/activar', { codigo: codigo.trim() });
      setAviso({ tipo: 'ok', texto: data.mensaje });
      setConfig(null);
      setCodigo('');
      await cargar();
    });

  const desactivar = () =>
    ejecutar(async () => {
      const { data } = await api.post('/auth/2fa/desactivar', { codigo: codigo.trim() });
      setAviso({ tipo: 'ok', texto: data.mensaje });
      setCodigo('');
      await cargar();
    });

  const inputCls = 'mt-1 w-full max-w-xs px-4 py-2 rounded-xl border border-outline-variant/50 bg-white font-body text-lg tracking-widest';
  const btnCls = 'px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-40';

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <header>
        <h2 className="font-display text-2xl font-bold text-primary">Seguridad de la cuenta</h2>
        <p className="font-body text-sm text-on-surface-variant">
          El segundo factor protege las operaciones de mayor riesgo: suspender o revocar cuentas, cambiar roles,
          cerrar sesiones de otros usuarios, crear administradores y eliminar registros.
        </p>
      </header>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-4 font-body text-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Segundo factor (TOTP):</span>
          {activo === null ? (
            <span>…</span>
          ) : (
            <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${activo ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {activo ? 'ACTIVO' : 'NO ACTIVADO'}
            </span>
          )}
        </div>

        {aviso && (
          <p className={aviso.tipo === 'ok' ? 'text-green-700' : 'text-error'}>{aviso.texto}</p>
        )}

        {activo === false && !config && (
          <button className={btnCls} disabled={trabajando} onClick={generar}>
            Activar segundo factor
          </button>
        )}

        {activo === false && config && (
          <div className="space-y-4">
            <ol className="list-decimal pl-5 space-y-1 text-on-surface-variant">
              <li>Abre Google Authenticator, Microsoft Authenticator o Authy.</li>
              <li>Elige «Introducir clave de configuración» (cuenta VetCare, tipo basado en tiempo).</li>
              <li>Escribe esta clave y luego el código de 6 dígitos que muestre la app:</li>
            </ol>
            <code className="block p-3 rounded-xl bg-surface-container-low break-all select-all text-base">{config.secreto}</code>
            <details className="text-xs text-on-surface-variant">
              <summary className="cursor-pointer">Enlace otpauth (para apps que lo aceptan)</summary>
              <code className="block mt-2 break-all select-all">{config.otpauth_uri}</code>
            </details>
            <label className="block">
              <span className="text-on-surface-variant">Código de 6 dígitos</span>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                className={inputCls}
                placeholder="000000"
              />
            </label>
            <button className={btnCls} disabled={trabajando || codigo.length !== 6} onClick={confirmarActivacion}>
              Confirmar y activar
            </button>
          </div>
        )}

        {activo === true && (
          <div className="space-y-3">
            <p className="text-on-surface-variant">
              Para desactivarlo, ingresa un código vigente de tu app autenticadora.
            </p>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              className={inputCls}
              placeholder="000000"
            />
            <div>
              <button className={`${btnCls} bg-error`} disabled={trabajando || codigo.length !== 6} onClick={desactivar}>
                Desactivar segundo factor
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
