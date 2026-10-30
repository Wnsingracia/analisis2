
import gatito404 from '../../assets/gatito-404.png';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  // Dashboard correspondiente a cada tipo de usuario
  const RUTA_POR_ROL: Record<string, string> = {
    ADMIN: '/admin/dashboard',
    CLIENTE: '/dashboard-cliente',
    VETERINARIO: '/dashboard-veterinario',
    ESTILISTA: '/dashboard-estilista',
    RECEPCIONISTA: '/dashboard-recepcionista',
  };

  const handleVolverInicio = () => {
    // Si existe una sesión activa
    if (usuario) {
      const destino = RUTA_POR_ROL[usuario.tipo_usuario];

      // Si tiene un rol válido, ir a su dashboard
      if (destino) {
        navigate(destino, { replace: true });
        return;
      }
    }

    // Si no hay sesión activa, ir al Home público
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbfa] px-6 py-10 text-center">

      {/* Gatito jugando con el cable */}
      <div className="w-full max-w-2xl -mt-4 mb-6">
        <img
          src={gatito404}
          alt="Un gatito jugando con un cable"
          className="w-full max-h-[360px] object-contain"
        />
      </div>

      {/* Mensaje */}
      <h2 className="text-2xl sm:text-4xl font-bold text-[#123b4a] mb-4">
        ¡Ups! Página no encontrada
      </h2>

      {/* Botón para regresar */}
      <button
        onClick={handleVolverInicio}
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#087f83] px-8 py-4 text-white font-semibold shadow-md transition-all hover:bg-[#06696d] hover:shadow-lg hover:-translate-y-0.5"
      >
        Volver al inicio
      </button>

      <p className="mt-8 text-xs text-gray-400">
        VetCare · Cuidamos de quienes más quieres
      </p>
    </div>
  );
}
