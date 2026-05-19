import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const TopNavBar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 lg:px-20 py-4 bg-surface-container-low/90 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-3xl icon-fill">pets</span>
        <span className="font-display text-2xl font-bold text-primary">VetCare</span>
      </div>
      <div className="hidden md:flex gap-8 items-center">
        <a className="font-body text-sm font-semibold text-secondary border-b-2 border-secondary pb-1 hover:scale-105 transition-transform duration-200" href="#">Servicios</a>
        <a className="font-body text-sm font-semibold text-on-surface-variant hover:text-primary hover:scale-105 transition-transform duration-200" href="#">Nosotros</a>
        <a className="font-body text-sm font-semibold text-on-surface-variant hover:text-primary hover:scale-105 transition-transform duration-200" href="#">Citas</a>
      </div>
      {/* Conexión de ruta directa al Login */}
      <Link to="/login">
        <Button variant="secondary">Login</Button>
      </Link>
    </nav>
  );
};

// ... El resto del componente HeroSection usa <Button variant="primary" icon="calendar_month">Reservar Cita</Button> y <Button variant="outline">Nuestros Servicios</Button>

const HeroSection = () => {
  return (
    // Sección expandida al 100% del ancho
    <section className="relative w-full px-6 lg:px-20 py-16 lg:py-24">
      {/* Se usa lg:grid-cols-2 para evitar que se aplaste en laptops pequeñas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Text Content */}
        <div className="w-full z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-body text-xs font-semibold mb-6 border border-outline-variant">
            Clínica Veterinaria & Spa Paws & Palms
          </span>
          
          <h1 className="font-display text-4xl lg:text-[56px] lg:leading-[64px] text-on-surface mb-6 font-bold tracking-tight">
            Cuidado experto para tus <span className="text-primary">mejores amigos</span>
          </h1>
          
          {/* Párrafo sin restricción de max-width, usando pr-12 para dejar espacio de respiro */}
          <p className="font-body text-[18px] lg:text-[20px] leading-relaxed text-on-surface-variant mb-10 w-full lg:pr-12">
            Servicios médicos veterinarios y spa de lujo para mascotas en un solo lugar. Brindamos amor, salud y relajación para quienes más lo merecen.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-secondary-container text-white font-body text-sm font-semibold px-8 py-3.5 rounded-full shadow-ambient hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
              <span>Reservar Cita</span>
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </button>
            <button className="bg-surface text-primary border border-outline-variant font-body text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
              <span>Nuestros Servicios</span>
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative mt-8 lg:mt-0 w-full">
          <div className="absolute inset-0 bg-primary-container/20 rounded-[3rem] transform rotate-3 scale-105 z-0"></div>
          
          <img 
            alt="Perro Golden Retriever y gato relajados" 
            className="relative z-10 w-full h-[400px] lg:h-[550px] object-cover rounded-[2.5rem] shadow-ambient border-4 border-surface-container-lowest" 
            src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1000&auto=format&fit=crop" 
          />
          
          <div className="absolute -bottom-6 -left-2 lg:-left-6 z-20 bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-4 shadow-ambient flex items-center gap-4 border border-outline-variant/30">
            <div className="bg-tertiary-container text-on-tertiary-container w-12 h-12 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined icon-fill">favorite</span>
            </div>
            <div>
              <p className="font-display text-2xl text-on-surface m-0 font-bold">5k+</p>
              <p className="font-body text-xs font-semibold text-on-surface-variant m-0">Mascotas Felices</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="w-full px-6 lg:px-20 py-12 flex flex-col md:flex-row justify-between items-center border-t border-outline-variant bg-surface-container-highest mt-24">
      <div className="flex items-center gap-2 mb-6 md:mb-0">
        <span className="material-symbols-outlined text-primary text-2xl icon-fill">pets</span>
        <span className="font-display text-xl font-bold text-primary">VetCare Animal Center</span>
      </div>
      <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
        <a className="font-body text-sm text-on-surface-variant hover:text-primary hover:underline decoration-secondary decoration-2 transition-colors" href="#">Política de Privacidad</a>
        <a className="font-body text-sm text-on-surface-variant hover:text-primary hover:underline decoration-secondary decoration-2 transition-colors" href="#">Términos de Servicio</a>
        <a className="font-body text-sm text-on-surface-variant hover:text-primary hover:underline decoration-secondary decoration-2 transition-colors" href="#">Contacto</a>
      </div>
      <p className="font-body text-sm text-on-surface-variant text-center md:text-right">
        © 2026 VetCare Animal Center. Todos los derechos reservados.
      </p>
    </footer>
  );
};

// --- PANTALLA PRINCIPAL ---

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pt-20 selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      <TopNavBar />
      <main className="flex-grow">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}