import { Link } from 'react-router-dom';

export default function Citas() {
  return (
    <div className="min-h-screen flex flex-col pt-20 bg-surface text-on-surface">
      <div className="px-6 lg:px-20 py-12 max-w-3xl mx-auto w-full">
        <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-body text-xs font-semibold mb-4 border border-outline-variant">
          Sistema de Citas
        </span>
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-2">
          Reserva una cita para tu <span className="text-primary">mascota</span>
        </h1>
        <p className="font-body text-on-surface-variant mb-8">
          Completa el formulario para agendar su próxima consulta o servicio de spa.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); alert('Cita enviada con éxito (Simulación)'); }} className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/40 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Nombre del Propietario</label>
            <input type="text" placeholder="Ej. Ana Pérez" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre de la Mascota</label>
              <input type="text" placeholder="Ej. Lúa" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Servicio Requerido</label>
              <select className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary">
                <option>Medicina General</option>
                <option>Spa & Grooming</option>
                <option>Vacunación</option>
                <option>Urgencia</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Fecha Preferida</label>
              <input type="date" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Hora Preferida</label>
              <input type="time" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary" required />
            </div>
          </div>

          <button type="submit" className="w-full bg-secondary-container text-white py-3.5 rounded-xl font-semibold shadow-ambient hover:scale-[1.02] active:scale-[0.98] transition-all">
            Confirmar Reserva
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-primary font-semibold hover:underline">← Volver al Inicio</Link>
        </div>
      </div>
    </div>
  );
}