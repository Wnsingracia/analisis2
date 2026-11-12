import React, { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SideNavBarRecepcionista } from './SideNavBarRecepcionista';
import { TopBar } from '../TopBar';
import { autorizarDispositivo } from '../../../services/dispositivos.service';
import { useAuth } from '../../../context/AuthContext';

type Estado = 'verificando' | 'autorizado' | 'error';

export const RecepcionistaLayout: React.FC = () => {
  const { cerrarSesion } = useAuth();
  const [estado, setEstado] = useState<Estado>('verificando');
  const [mensaje, setMensaje] = useState('');

  const autorizar = useCallback(async () => {
    setEstado('verificando');
    setMensaje('');
    try {
      const id = localStorage.getItem('vetcare_device_id');
      if (!id) throw new Error('Esta computadora no tiene un ID de dispositivo configurado.');
      await autorizarDispositivo(id);
      setEstado('autorizado');
    } catch (e: any) {
      setMensaje(e.response?.data?.message || e.message || 'No se pudo verificar esta computadora.');
      setEstado('error');
    }
  }, []);

  useEffect(() => { autorizar(); }, [autorizar]);

  return (
    <div className="flex w-full min-h-screen bg-surface">
      <SideNavBarRecepcionista />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">
          {estado === 'autorizado' ? (
            <Outlet />
          ) : (
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
              {estado === 'verificando' ? (
                <p>Verificando esta computadora...</p>
              ) : (
                <>
                  <p className="text-red-800 mb-4">{mensaje}</p>
                  <button onClick={autorizar} className="rounded-xl px-5 py-3 bg-primary text-white mr-3">
                    Reintentar
                  </button>
                  <button onClick={cerrarSesion} className="rounded-xl px-5 py-3 border">
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};