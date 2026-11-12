
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SideNavBarRecepcionista } from './SideNavBarRecepcionista';
import { TopBar } from '../TopBar';

import { autorizarDispositivo } from '../../../services/dispositivos.service';

export const RecepcionistaLayout: React.FC = () => {
  const [autorizando, setAutorizando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [autorizado, setAutorizado] = useState(false);

  const manejarAutorizacion = async () => {
    try {
      setAutorizando(true);
      setMensaje('');
      setAutorizado(false);

      const resultado = await autorizarDispositivo('1');

      setAutorizado(true);
      setMensaje(
        resultado.mensaje || 'Esta computadora ha sido autorizada correctamente.',
      );
    } catch (error: any) {
      setMensaje(
        error.response?.data?.message ||
        error.message ||
        'No se pudo autorizar esta computadora.',
      );
    } finally {
      setAutorizando(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-surface">
      <SideNavBarRecepcionista />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <TopBar />

        <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">

          {/* AUTORIZACIÓN DE DISPOSITIVO */}
          <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-low p-5">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h2 className="font-semibold text-on-surface">
                  Seguridad del dispositivo
                </h2>

                <p className="text-sm text-on-surface-variant mt-1">
                  Autoriza esta computadora para agregar y modificar registros.
                </p>
              </div>

              <button
                type="button"
                onClick={manejarAutorizacion}
                disabled={autorizando || autorizado}
                className="rounded-xl px-5 py-3 font-semibold text-sm bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {autorizando
                  ? 'Verificando dispositivo...'
                  : autorizado
                    ? 'Computadora autorizada'
                    : 'Autorizar esta PC'}
              </button>

            </div>

            {mensaje && (
              <div
                className={`mt-4 rounded-lg p-3 text-sm ${
                  autorizado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {mensaje}
              </div>
            )}

          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};
