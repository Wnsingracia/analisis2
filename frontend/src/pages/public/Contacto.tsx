import { Link } from 'react-router-dom';

export default function Contacto() {
  return (
    <div className="min-h-screen flex flex-col pt-20 bg-surface text-on-surface">
      <div className="px-6 lg:px-20 py-12 max-w-5xl mx-auto w-full">
        <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-body text-xs font-semibold mb-4 border border-outline-variant">
          Contacto
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          Ponte en contacto con <span className="text-primary">nosotros</span>
        </h1>
        <p className="font-body text-lg text-on-surface-variant mb-12">
          ¿Tienes dudas o necesitas asistencia rápida? Escríbenos o visítanos en nuestra clínica.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Ubicación</h3>
                <p className="text-on-surface-variant text-sm">Av. Principal de las Mascotas #123, Ciudad</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">call</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Teléfono</h3>
                <p className="text-on-surface-variant text-sm">+52 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Correo Electrónico</h3>
                <p className="text-on-surface-variant text-sm">contacto@vetcare.com</p>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Mensaje enviado'); }} className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/40 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Tu Nombre</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Correo Electrónico</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Mensaje</label>
              <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary" required></textarea>
            </div>
            <button type="submit" className="w-full bg-secondary-container text-white py-3 rounded-xl font-semibold shadow-ambient hover:scale-[1.02] transition-all">
              Enviar Mensaje
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-primary font-semibold hover:underline">← Volver al Inicio</Link>
        </div>
      </div>
    </div>
  );
}