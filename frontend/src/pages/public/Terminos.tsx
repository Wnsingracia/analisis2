import { Link } from 'react-router-dom';

export default function Terminos() {
  return (
    <div className="min-h-screen flex flex-col pt-20 bg-surface text-on-surface">
      <div className="px-6 lg:px-20 py-12 max-w-4xl mx-auto w-full">
        <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-body text-xs font-semibold mb-4 border border-outline-variant">
          Legal
        </span>
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          Términos de <span className="text-primary">Servicio</span>
        </h1>
        <p className="font-body text-sm text-on-surface-variant mb-8">
          Última actualización: Enero de 2026
        </p>

        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/40 space-y-6 font-body text-on-surface-variant leading-relaxed">
          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">1. Aceptación de los términos</h3>
            <p>
              Al acceder y utilizar la plataforma VetCare y sus servicios presenciales, aceptas cumplir con los presentes términos y condiciones de uso.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">2. Citas y cancelaciones</h3>
            <p>
              Las citas programadas deben cancelarse o reprogramarse con al menos 2 horas de anticipación. VetCare se reserva el derecho de gestionar la disponibilidad según la urgencia médica de otros pacientes.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">3. Responsabilidad del propietario</h3>
            <p>
              Los dueños de las mascotas son responsables de proporcionar historiales médicos verídicos y mantener a sus animales bajo el control adecuado (correa, transportadora) dentro de las instalaciones.
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