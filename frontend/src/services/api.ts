import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // el navegador envía la cookie httpOnly en cada petición
});

// Sesión vencida o inválida: vuelve al login.
// Se excluye '/auth/': un 401 en el login significa "credenciales incorrectas",
// y /auth/me responde 401 cuando aún no hay sesión. Sin esta exclusión la
// página del login se recargaría en bucle.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const url: string = error.config?.url ?? '';
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export default api;