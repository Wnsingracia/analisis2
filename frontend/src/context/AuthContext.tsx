import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

export interface Usuario {
  id_usuario: string; nombres: string; ap_pat: string; tipo_usuario: string;
}
interface AuthCtx {
  usuario: Usuario | null;
  cargando: boolean;
  setUsuario: (u: Usuario | null) => void;
  cerrarSesion: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((r) => setUsuario(r.data))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  const cerrarSesion = async () => {
    try { await api.post('/auth/logout'); } finally { setUsuario(null); }
  };

  return <Ctx.Provider value={{ usuario, cargando, setUsuario, cerrarSesion }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return c;
};