
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Mascota {
  id_mascota: number;
  nombre: string;
  especie?: string | null;
  raza?: string | null;
  sexo?: string | null;
  fecha_nacimiento?: string | null;
  peso?: number | string | null;
  foto?: string | null;
  [key: string]: unknown;
}

export default function MisMascotas() {
  const { usuario, cargando } = useAuth();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cargando) return;

    if (!usuario || usuario.tipo_usuario !== 'CLIENTE') {
      setCargandoMascotas(false);
      return;
    }

    let activo = true;

    const obtenerMascotas = async () => {
      setCargandoMascotas(true);
      setError('');

      try {
        const respuesta = await api.get(
          `/mascotas/${usuario.id_usuario}`
        );

        // Admite una respuesta que sea directamente un array
        // o un objeto que contenga la propiedad mascotas.
        const datos = respuesta.data;
        const lista = Array.isArray(datos)
          ? datos
          : datos?.mascotas;

        if (!Array.isArray(lista)) {
          throw new Error('El formato de respuesta no es válido.');
        }

        if (activo) {
          setMascotas(lista);
        }
      } catch (err) {
        console.error('Error al obtener mascotas:', err);

        if (activo) {
          setError(
            'No se pudieron cargar tus mascotas. Intenta nuevamente.'
          );
        }
      } finally {
        if (activo) {
          setCargandoMascotas(false);
        }
      }
    };

    obtenerMascotas();

    return () => {
      activo = false;
    };
  }, [usuario, cargando]);

  if (cargando || cargandoMascotas) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-semibold text-primary animate-pulse">
          Cargando tus mascotas...
        </p>
      </div>
    );
  }

  if (!usuario || usuario.tipo_usuario !== 'CLIENTE') {
    return (
      <div className="p-6 text-center text-gray-600">
        No tienes autorización para ver estas mascotas.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">

      {/* ENCABEZADO */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-secondary mb-2">
            MI ESPACIO VETCARE
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            Mis Mascotas
          </h1>

          <p className="mt-2 text-sm text-on-surface-variant">
            Aquí puedes consultar la información de tus compañeros peludos.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-sm">
          <span className="material-symbols-outlined text-3xl text-primary">
            pets
          </span>

          <div>
            <p className="text-2xl font-bold text-primary">
              {mascotas.length}
            </p>
            <p className="text-xs text-on-surface-variant">
              {mascotas.length === 1 ? 'Mascota registrada' : 'Mascotas registradas'}
            </p>
          </div>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-2 font-semibold underline"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {/* LISTADO */}
      {!error && mascotas.length === 0 ? (
        <div className="bg-white rounded-3xl border border-outline-variant/30 p-10 sm:p-16 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-5xl text-primary">
              pets
            </span>
          </div>

          <h2 className="text-xl font-bold text-primary">
            Aún no tienes mascotas registradas
          </h2>

          <p className="mt-3 text-sm text-on-surface-variant max-w-md mx-auto">
            Cuando registres tus mascotas, podrás consultar aquí su información.
          </p>
        </div>
      ) : (
        !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {mascotas.map((mascota) => (
              <article
                key={mascota.id_mascota}
                className="overflow-hidden rounded-3xl bg-white border border-outline-variant/30 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* CABECERA DE LA TARJETA */}
                <div className="flex items-center gap-4 bg-primary/5 p-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white border border-outline-variant/30">
                    {mascota.foto ? (
                      <img
                        src={mascota.foto}
                        alt={mascota.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-primary">
                        pets
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-primary">
                      {mascota.nombre}
                    </h2>

                    <p className="text-sm text-on-surface-variant">
                      {mascota.especie || 'Especie no especificada'}
                    </p>
                  </div>
                </div>

                {/* INFORMACIÓN */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-surface-variant">
                      Raza
                    </span>
                    <span className="text-sm font-semibold text-gray-800 text-right">
                      {mascota.raza || 'No especificada'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-surface-variant">
                      Sexo
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {mascota.sexo || 'No especificado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-surface-variant">
                      Nacimiento
                    </span>
                    <span className="text-sm font-semibold text-gray-800 text-right">
                      {mascota.fecha_nacimiento
                        ? new Date(
                            mascota.fecha_nacimiento
                          ).toLocaleDateString('es-BO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            timeZone: 'UTC',
                          })
                        : 'No especificado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-surface-variant">
                      Peso
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {mascota.peso != null
                        ? `${mascota.peso} kg`
                        : 'No especificado'}
                    </span>
                  </div>

                  <div className="border-t border-outline-variant/30 pt-4">
                    <span className="text-xs text-on-surface-variant">
                      Código de mascota: #{mascota.id_mascota}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      )}
    </div>
  );
}
