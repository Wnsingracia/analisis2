import React from 'react';

export default function Dashboard() {
  return (
    <>
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">Panel General</h2>
          <p className="font-body text-lg text-on-surface-variant">Bienvenido de vuelta. Aquí tienes un resumen del día.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container px-5 py-2.5 rounded-full border border-outline-variant/30">
          <span className="material-symbols-outlined text-tertiary">today</span>
          <span className="font-body text-sm font-bold text-on-surface">Octubre 24, 2026</span>
        </div>
      </div>

      {/* Grilla de Contenido Principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Fila de Estadísticas */}
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
          <div className="bg-white rounded-[1.5rem] p-6 shadow-ambient hover:-translate-y-1 hover:shadow-lg transition-all relative overflow-hidden group border border-outline-variant/20">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="font-body text-sm font-semibold text-on-surface-variant mb-1">Citas Totales (Hoy)</p>
                <h3 className="font-display text-4xl font-bold text-on-surface">24</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined icon-fill">pets</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary relative z-10 font-body text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+12% vs ayer</span>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-6 shadow-ambient hover:-translate-y-1 hover:shadow-lg transition-all relative overflow-hidden group border border-outline-variant/20">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-tertiary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="font-body text-sm font-semibold text-on-surface-variant mb-1">Nuevas Mascotas (Mes)</p>
                <h3 className="font-display text-4xl font-bold text-on-surface">18</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-tertiary-container text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined icon-fill">favorite</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-tertiary relative z-10 font-body text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+5% vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-6 shadow-ambient hover:-translate-y-1 hover:shadow-lg transition-all relative overflow-hidden group border border-outline-variant/20">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary-container/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="font-body text-sm font-semibold text-on-surface-variant mb-1">Ingresos Estimados</p>
                <h3 className="font-display text-4xl font-bold text-on-surface">$4.2k</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined icon-fill">payments</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant relative z-10 font-body text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
              <span>Estable</span>
            </div>
          </div>
        </div>

        {/* Tabla de Citas del Día */}
        <div className="col-span-1 md:col-span-8 flex flex-col">
          <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/20 overflow-hidden flex-1 flex flex-col">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <h3 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">view_list</span>
                Citas del día
              </h3>
              <button className="font-body text-sm font-bold text-primary hover:text-primary-container transition-colors">Ver todas</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant/30">
                    <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hora</th>
                    <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Paciente</th>
                    <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Servicio</th>
                    <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Estado</th>
                    <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr className="hover:bg-surface-bright/50 transition-colors group">
                    <td className="py-4 px-6 font-body text-sm font-bold text-on-surface">09:00 AM</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                          <span className="material-symbols-outlined text-[18px]">pets</span>
                        </div>
                        <div>
                          <p className="font-body text-sm font-bold text-on-surface">Max</p>
                          <p className="font-body text-xs text-on-surface-variant">Golden Retriever</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-body text-sm text-on-surface-variant">Vacunación Anual</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary font-body text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        En curso
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 text-on-surface-variant hover:text-tertiary transition-colors rounded-full hover:bg-surface-container">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alertas de Stock */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-8">
          <div className="bg-white rounded-[1.5rem] p-6 shadow-ambient border border-outline-variant/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">warning</span>
                Stock bajo
              </h3>
              <span className="bg-error-container text-on-error-container font-body text-xs font-bold px-2.5 py-1 rounded-full">Alertas</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3.5 rounded-xl border border-error-container/50 bg-error-container/10 hover:bg-error-container/20 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-white border border-error-container/30 flex items-center justify-center text-error shadow-sm">
                  <span className="material-symbols-outlined">medication</span>
                </div>
                <div className="flex-1">
                  <p className="font-body text-sm font-bold text-on-surface">Vacuna Antirrábica</p>
                  <p className="font-body text-xs font-semibold text-error mt-0.5">Quedan 2 unidades</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2.5 border-2 border-outline-variant rounded-xl font-body text-sm font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              Ir al Inventario
            </button>
          </div>
        </div>

      </div>
    </>
  );
}