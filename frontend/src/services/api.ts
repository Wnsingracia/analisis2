
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

// =====================================================
// AUTORIZACIÓN DEL DISPOSITIVO (SOLO EN MEMORIA)
// =====================================================

let deviceAuthorizationToken: string | null = null;

/**
 * Guarda la autorización obtenida después de verificar
 * la firma del agente Python.
 */
export const establecerAutorizacionDispositivo = (
  token: string,
): void => {
  deviceAuthorizationToken = token;
};

/**
 * Elimina la autorización del dispositivo.
 */
export const limpiarAutorizacionDispositivo = (): void => {
  deviceAuthorizationToken = null;
};

/**
 * Comprueba si existe una autorización en memoria.
 */
export const tieneAutorizacionDispositivo = (): boolean => {
  return !!deviceAuthorizationToken;
};

// =====================================================
// INTERCEPTOR DE SOLICITUDES
// =====================================================

api.interceptors.request.use((config) => {
  const metodo = (config.method ?? 'get').toUpperCase();

  const metodosEscritura = [
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
  ];

  const url = config.url ?? '';

  // Los endpoints de autorización no necesitan
  // presentar previamente un token de dispositivo.
  const esEndpointAutorizacion =
    url.startsWith('/dispositivos/desafio') ||
    url.startsWith('/dispositivos/verificar');

  if (
    deviceAuthorizationToken &&
    metodosEscritura.includes(metodo) &&
    !esEndpointAutorizacion
  ) {
    config.headers['x-device-authorization'] =
      deviceAuthorizationToken;
  }

  return config;
});

// =====================================================
// INTERCEPTOR DE RESPUESTAS
// =====================================================

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const config = error.config as any;
    const url: string = config?.url ?? '';
    const data = error.response?.data;

    // Segundo factor TOTP.
    if (
      error.response?.status === 403 &&
      data?.codigo === 'REQUIERE_2FA' &&
      config &&
      !config._reintento2fa
    ) {
      const codigo = window.prompt(
        `${data.message}\n\nCódigo de 6 dígitos:`,
      );

      if (codigo && codigo.trim()) {
        config._reintento2fa = true;
        config.headers = config.headers ?? {};
        config.headers['x-codigo-2fa'] = codigo.trim();

        return api.request(config);
      }
    }

    // Sesión vencida, revocada o inválida.
    if (
      error.response?.status === 401 &&
      !url.startsWith('/auth/')
    ) {
      limpiarAutorizacionDispositivo();
      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);

export default api;
