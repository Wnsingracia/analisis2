import { Link } from 'react-router-dom';

export default function Servicios() {
  const serviciosLista = [
    {
      titulo: "Medicina General y Preventiva",
      desc: "Consultas integrales, vacunación, desparasitación, revisiones de rutina y chequeos periódicos.",
      icono: "medical_services"
    },
    {
      titulo: "Spa & Estética Canina y Felina",
      desc: "Baños relajantes y medicados, cortes de raza, secado profesional, cepillado de dientes y limpieza de oídos.",
      icono: "spa"
    },
    {
      titulo: "Venta de Medicamentos y Farmacia",
      desc: "Amplio catálogo de fármacos veterinarios, antipulgas, desparasitantes, antibióticos y suplementos especializados.",
      icono: "pharmacy_types"
    },
    {
      titulo: "Pet Shop & Productos de Calidad",
      desc: "Alimento súper premium, snacks nutritivos, juguetes interactivos, accesorios de higiene y ropa para mascotas.",
      icono: "shopping_bag"
    },
    {
      titulo: "Cirugía y Quirófano Equipado",
      desc: "Procedimientos quirúrgicos generales y de especialidad con anestesia inhalada y monitoreo constante.",
      icono: "surgery"
    },
    {
      titulo: "Laboratorio y Diagnóstico",
      desc: "Análisis clínicos, ecografías, rayos X digitales y pruebas rápidas para un diagnóstico preciso.",
      icono: "biotech"
    },
    {
      titulo: "Urgencias y Cuidados Críticos 24/7",
      desc: "Atención médica inmediata ante emergencias, hospitalización y monitoreo intensivo.",
      icono: "emergency"
    },
    {
      titulo: "Hotel y Hospedaje Canino/Felino",
      desc: "Espacios seguros, limpios y climatizados con supervisión constante y actividades recreativas.",
      icono: "home"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-surface text-on-surface">
      <div className="px-6 lg:px-20 py-12 max-w-6xl mx-auto">
        <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-body text-xs font-semibold mb-4 border border-outline-variant">
          Nuestros Servicios & Productos
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          Cuidado integral y <span className="text-primary">productos para tu mascota</span>
        </h1>
        <p className="font-body text-lg text-on-surface-variant mb-12 max-w-2xl">
          Desde atención médica y sesiones de spa hasta farmacia especializada y productos de primera calidad para garantizar el bienestar de tu compañero.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviciosLista.map((s, index) => (
            <div 
              key={index} 
              className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/40 hover:border-primary hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">{s.icono}</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-2 text-on-surface">{s.titulo}</h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center flex justify-center gap-4">
          <Link 
            to="/Login" 
            className="bg-secondary-container text-white px-8 py-3.5 rounded-full font-semibold shadow-ambient hover:scale-105 transition-all"
          >
            Reservar Cita o Spa
          </Link>
          <Link 
            to="/" 
            className="border border-outline-variant px-6 py-3.5 rounded-full font-semibold hover:bg-surface-variant transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}