import React from 'react';
import { Outlet } from 'react-router-dom';
import { SideNavBar } from './SideNavBar';
import { AdminTopBar } from './AdminTopBar';

export const AdminLayout: React.FC = () => {
  return (
    <div className="bg-background text-on-surface font-body antialiased overflow-hidden flex h-screen w-full">
      {/* Componente fijo a la izquierda */}
      <SideNavBar />

      {/* Lado derecho variable */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Componente fijo arriba */}
        <AdminTopBar />

        {/* Zona con scroll donde cargará dinámicamente Dashboard o Staff */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-surface">
          <Outlet />
        </div>
      </div>
    </div>
  );
};