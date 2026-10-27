import { Link } from 'react-router-dom';

export default function Nosotros() {
  return (
    <div className="min-h-screen flex flex-col pt-20 bg-surface text-on-surface">
      {/* Header simple o puedes importar tu TopNavBar */}
      <div className="px-6 lg:px-20 py-12 max-w-5xl mx-auto">
        <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-body text-xs font-semibold mb-4 border border-outline-variant">
          Sobre Nosotros
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          Amor, ciencia y dedicación para <span className="text-primary">tus mascotas</span>
        </h1>
        <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-8">
          En **VetCare & Spa Paws & Palms** nos apasiona brindar un servicio integral que combina la más alta calidad médica veterinaria con un espacio de bienestar y relajación único para perros y gatos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/50">
            <h3 className="font-display text-2xl font-bold text-primary mb-3">Nuestra Misión</h3>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Garantizar la salud y felicidad de cada mascota mediante diagnósticos precisos, tratamientos compasivos y un trato humano excepcional, apoyados por tecnología de vanguardia.
            </p>
          </div>
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/50">
            <h3 className="font-display text-2xl font-bold text-primary mb-3">Nuestra Visión</h3>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Ser la clínica veterinaria y spa líder en la región, reconocida por la excelencia médica, la innovación en nuestros servicios y el amor incondicional hacia los animales.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/" className="text-primary font-semibold hover:underline">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}