import { AsyncLocalStorage } from 'async_hooks';

/**
 * Contexto de la petición HTTP en curso. Permite que cualquier servicio sepa
 * QUIÉN actúa y desde qué IP (para la auditoría) sin pasar el usuario por
 * todas las firmas. Lo crea el middleware de main.ts y lo completa el JwtAuthGuard.
 */
export interface ContextoPeticion {
  ip?: string;
  user?: { id_usuario: string; tipo_usuario: string; correo?: string; emergencia?: boolean };
  // Se marca cuando ya se registró un evento DENEGADO específico de esta petición
  denegadoRegistrado?: boolean;
}

export const contextoStorage = new AsyncLocalStorage<ContextoPeticion>();

export const contextoActual = (): ContextoPeticion | undefined =>
  contextoStorage.getStore();
