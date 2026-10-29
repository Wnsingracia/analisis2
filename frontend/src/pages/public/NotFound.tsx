import gatito404 from '../../assets/gatito-404.png';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

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
        onClick={() => navigate('/')}
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#087f83] px-8 py-4 text-white font-semibold shadow-md transition-all hover:bg-[#06696d] hover:shadow-lg hover:-translate-y-0.5">
        Volver al inicio
      </button>

      <p className="mt-8 text-xs text-gray-400">
        VetCare · Cuidamos de quienes más quieres
      </p>
    </div>
  );
}
