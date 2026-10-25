import { Link } from 'react-router-dom';

export default function Privacidad() {
  return (
    <div className="min-h-screen flex flex-col pt-20 bg-surface text-on-surface">
      <div className="px-6 lg:px-20 py-12 max-w-4xl mx-auto w-full">
        <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-body text-xs font-semibold mb-4 border border-outline-variant">
          Legal
        </span>
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          Política de <span className="text-primary">Privacidad</span>
        </h1>
        <p className="font-body text-sm text-on-surface-variant mb-8">
          Última actualización: Enero de 2026
        </p>

        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/40 space-y-6 font-body text-on-surface-variant leading-relaxed">
          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">1. Información que recopilamos</h3>
            <p>
              En VetCare recopilamos información personal que tú nos proporcionas voluntariamente al registrarte, agendar una cita o contactarnos (como nombre, correo electrónico, teléfono y datos de tus mascotas).
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">2. Uso de la información</h3>
            <p>
              Utilizamos tus datos exclusivamente para gestionar citas médicas, coordinar servicios de spa, enviar recordatorios importantes y mejorar la experiencia de atención para tus mascotas.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">3. Protección de datos</h3>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra acceso no autorizado, pérdida o alteración. No compartimos tus datos con terceros sin tu consentimiento.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-primary font-semibold hover:underline">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}