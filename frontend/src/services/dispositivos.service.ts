
import api, {
  establecerAutorizacionDispositivo,
  limpiarAutorizacionDispositivo,
} from './api';

// =====================================================
// CONFIGURACIÓN DEL AGENTE LOCAL
// =====================================================

const DEVICE_AGENT_URL = 'http://127.0.0.1:8765';

// =====================================================
// INTERFACES
// =====================================================

export interface DesafioDispositivo {
  idDesafio: string;
  nonce: string;
  challengeToken: string;
  expiraEnSegundos: number;
}

interface FirmaAgente {
  signature: string;
  publicKey?: string;
}

interface RespuestaAutorizacion {
  autorizado: boolean;
  authorizationToken: string;
  expiraEnSegundos: number;
  mensaje: string;
}

// =====================================================
// 1. COMPROBAR AGENTE PYTHON
// =====================================================

export async function comprobarAgente(): Promise<boolean> {
  try {
    const respuesta = await fetch(
      `${DEVICE_AGENT_URL}/health`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      },
    );

    if (!respuesta.ok) {
      return false;
    }

    const data = await respuesta.json();

    return (
      data.status === 'ok' ||
      data.status === 'healthy' ||
      data.estado === 'ACTIVO'
    );
  } catch {
    return false;
  }
}

// =====================================================
// 2. SOLICITAR DESAFÍO AL BACKEND
// =====================================================

export async function solicitarDesafio(
  idDispositivo: string,
): Promise<DesafioDispositivo> {
  const respuesta = await api.post<DesafioDispositivo>(
    '/dispositivos/desafio',
    {
      idDispositivo,
    },
  );

  return respuesta.data;
}

// =====================================================
// 3. SOLICITAR FIRMA AL AGENTE PYTHON
// =====================================================

export async function firmarDesafio(
  desafio: DesafioDispositivo,
): Promise<FirmaAgente> {
  let respuesta: Response;

  try {
    respuesta = await fetch(
      `${DEVICE_AGENT_URL}/sign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenge_id: desafio.idDesafio,
          nonce: desafio.nonce,
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch {
    throw new Error(
      'No se pudo conectar con el agente local. Comprueba que VetCare Device Agent esté ejecutándose.',
    );
  }

  const data = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      'El agente local rechazó la solicitud de firma.',
    );
  }

  if (
    !data ||
    typeof data.signature !== 'string' ||
    !/^[A-Za-z0-9_-]{86}$/.test(data.signature)
  ) {
    throw new Error(
      'El agente devolvió una firma inválida.',
    );
  }

  return {
    signature: data.signature,
    publicKey: data.publicKey,
  };
}

// =====================================================
// 4. VERIFICAR FIRMA EN EL BACKEND
// =====================================================

export async function verificarDispositivo(
  challengeToken: string,
  firma: string,
): Promise<RespuestaAutorizacion> {
  const respuesta = await api.post<RespuestaAutorizacion>(
    '/dispositivos/verificar',
    {
      challengeToken,
      firma,
    },
  );

  const resultado = respuesta.data;

  if (
    !resultado.autorizado ||
    !resultado.authorizationToken
  ) {
    throw new Error(
      'El servidor no pudo autorizar este dispositivo.',
    );
  }

  // La autorización se conserva únicamente en memoria.
  establecerAutorizacionDispositivo(
    resultado.authorizationToken,
  );

  return resultado;
}

// =====================================================
// 5. PROCESO COMPLETO DE AUTORIZACIÓN
// =====================================================

export async function autorizarDispositivo(
  idDispositivo: string,
): Promise<RespuestaAutorizacion> {
  limpiarAutorizacionDispositivo();

  // A. Comprobar que el agente esté disponible.
  const agenteDisponible = await comprobarAgente();

  if (!agenteDisponible) {
    throw new Error(
      'El agente de VetCare no está disponible en esta computadora.',
    );
  }

  // B. Solicitar desafío al backend.
  const desafio = await solicitarDesafio(idDispositivo);

  // C. Firmar el desafío utilizando la clave privada local.
  const resultadoFirma = await firmarDesafio(desafio);

  // D. Enviar firma al backend para su verificación.
  const autorizacion = await verificarDispositivo(
    desafio.challengeToken,
    resultadoFirma.signature,
  );

  return autorizacion;
}

// =====================================================
// 6. REVOCAR AUTORIZACIÓN LOCAL
// =====================================================

export function cerrarAutorizacionDispositivo(): void {
  limpiarAutorizacionDispositivo();
}
