import React from 'react';
import { Outlet } from 'react-router-dom';
import { SideNavBarVeterinario } from './SideNavBarVeterinario';
import { TopBar } from '../TopBar';

export const VeterinarioLayout: React.FC = () => {
  return (
    <div className="flex w-full min-h-screen bg-surface">
      {/* Barra lateral persistente */}
      <SideNavBarVeterinario />

      {/* Área principal */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">

        {/* Barra superior compartida */}
        <TopBar />

        {/* Contenido de la ruta seleccionada */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
