import React from 'react';
import { Outlet } from 'react-router-dom';
import { SideNavBarRecepcionista } from './SideNavBarRecepcionista';

export const RecepcionistaLayout: React.FC = () => {
  return (
    <div className="flex w-full min-h-screen bg-surface">
      {/* BARRA LATERAL DEL RECEPCIONISTA */}
      <SideNavBarRecepcionista />

      {/* CONTENIDO DE CADA PÁGINA */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};