import React from 'react';
import { Outlet } from 'react-router-dom';
import { SideNavBarCliente } from './SideNavBarCliente';

export const ClienteLayout: React.FC = () => {
  return (
    <div className="flex w-full min-h-screen bg-surface">
      {/* Barra lateral persistente */}
      <SideNavBarCliente />

      {/* Contenido de la ruta seleccionada */}
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};