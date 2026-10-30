import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // el navegador envía la cookie httpOnly en cada petición
});

// Sesión vencida, revocada o inválida: vuelve al login.
// Se excluye '/auth/': un 401 en el login significa "credenciales incorrectas",
// y /auth/me responde 401 cuando aún no hay sesión. Sin esta exclusión la
// página del login se recargaría en bucle.
//
// Segundo factor (Parte 2-e): si el servidor responde 403 con codigo 'REQUIERE_2FA'
// (operación de alto riesgo), se pide el código de la app autenticadora y se
// reintenta la MISMA petición una sola vez con la cabecera x-codigo-2fa.
api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const config = error.config as any;
    const url: string = config?.url ?? '';
    const data = error.response?.data;

    if (
      error.response?.status === 403 &&
      data?.codigo === 'REQUIERE_2FA' &&
      config &&
      !config._reintento2fa
    ) {
      const codigo = window.prompt(`${data.message}\n\nCódigo de 6 dígitos:`);
      if (codigo && codigo.trim()) {
        config._reintento2fa = true;
        config.headers = config.headers ?? {};
        config.headers['x-codigo-2fa'] = codigo.trim();
        return api.request(config);
      }
    }

    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export default api;
