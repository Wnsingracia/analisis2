
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Mascota {
  id_mascota: number;
  id_cliente: number;
  nombre: string;
  tipo?: string | null;
  raza?: string | null;
  edad?: number | null;
  peso?: number | null;
  altura?: number | null;
  alergias?: string | null;
  genero?: string | null;
}

interface FormularioMascota {
  nombre: string;
  tipo: string;
  raza: string;
  edad: string;
  peso: string;
  altura: string;
  alergias: string;
  genero: string;
}

const FORMULARIO_VACIO: FormularioMascota = {
  nombre: '',
  tipo: '',
  raza: '',
  edad: '',
  peso: '',
  altura: '',
  alergias: '',
  genero: '',
};

export default function MisMascotas() {
  const { usuario, cargando } = useAuth();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(true);
  const [error, setError] = useState('');

  // Control del formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioMascota>(FORMULARIO_VACIO);

  const [guardando, setGuardando] = useState(false);

  // OBTENER MASCOTAS
  const obtenerMascotas = async () => {
    try {
      setError('');

      const respuesta = await api.get('/mascotas');

      const datos = respuesta.data;
      const lista = Array.isArray(datos)
        ? datos
        : datos?.mascotas;

      if (!Array.isArray(lista)) {
        throw new Error('Formato de respuesta inválido');
      }

      setMascotas(lista);
    } catch (err) {
      console.error('Error al obtener mascotas:', err);
      setError('No se pudieron cargar tus mascotas.');
    } finally {
      setCargandoMascotas(false);
    }
  };

  useEffect(() => {
    if (cargando) return;

    if (!usuario || usuario.tipo_usuario !== 'CLIENTE') {
      setCargandoMascotas(false);
      return;
    }

    obtenerMascotas();
  }, [usuario, cargando]);

  // ABRIR FORMULARIO PARA REGISTRAR
  const abrirNuevo = () => {
    setEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setModalAbierto(true);
  };

  // ABRIR FORMULARIO PARA EDITAR
  const abrirEditar = (mascota: Mascota) => {
    setEditando(mascota.id_mascota);

    setFormulario({
      nombre: mascota.nombre || '',
      tipo: mascota.tipo || '',
      raza: mascota.raza || '',
      edad: mascota.edad != null ? String(mascota.edad) : '',
      peso: mascota.peso != null ? String(mascota.peso) : '',
      altura: mascota.altura != null ? String(mascota.altura) : '',
      alergias: mascota.alergias || '',
      genero: mascota.genero || '',
    });

    setModalAbierto(true);
  };

  // CAMBIAR CAMPOS
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // REGISTRAR O ACTUALIZAR
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formulario.nombre.trim() || !formulario.tipo || !formulario.genero) {
      alert('Completa el nombre, tipo y género de tu mascota.');
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        ...formulario,

        edad: formulario.edad ? Number(formulario.edad) : null,
        peso: formulario.peso ? Number(formulario.peso) : null,
        altura: formulario.altura ? Number(formulario.altura) : null,
      };
      
      if (editando !== null) {
        // ACTUALIZAR MASCOTA
        console.log('ID de mascota:', editando);
        console.log('Datos enviados:', datos);
        console.log('URL:', `/mascotas/${editando}`);

        await api.put(`/mascotas/${editando}`, datos);

        alert('¡Mascota actualizada correctamente!');
      } else {
        // REGISTRAR NUEVA MASCOTA
        await api.post('/mascotas', {
          ...datos,
          id_cliente: usuario?.id_usuario
        });

        alert('¡Mascota registrada correctamente!');
      }

      setModalAbierto(false);
      setFormulario(FORMULARIO_VACIO);
      setEditando(null);

      await obtenerMascotas();

    } catch (err: any) {
      console.error('Error al guardar mascota:', err);

      const mensaje = err.response?.data?.message;

      alert(
        Array.isArray(mensaje)
          ? mensaje.join('\n')
          : mensaje || 'No se pudo guardar la información de la mascota.'
      );
    } finally {
      setGuardando(false);
    }
  };

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
            Aquí puedes consultar y administrar la información de tus compañeros peludos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* CONTADOR */}
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl text-primary">
              pets
            </span>

            <div>
              <p className="text-2xl font-bold text-primary">
                {mascotas.length}
              </p>

              <p className="text-xs text-on-surface-variant">
                {mascotas.length === 1
                  ? 'Mascota registrada'
                  : 'Mascotas registradas'}
              </p>
            </div>
          </div>

          {/* BOTÓN NUEVA MASCOTA */}
          <button
            onClick={abrirNuevo}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-white font-bold shadow-md hover:opacity-90 transition"
          >
            <span className="material-symbols-outlined">
              add
            </span>
            Nueva mascota
          </button>

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
            onClick={obtenerMascotas}
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

          <p className="mt-2 text-on-surface-variant">
            ¡Registra a tu primer compañero peludo!
          </p>

          <button
            onClick={abrirNuevo}
            className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-white hover:opacity-90 transition"
          >
            + Registrar mi primera mascota
          </button>

        </div>

      ) : (

        !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

            {mascotas.map((mascota) => (

              <article
                key={mascota.id_mascota}
                className="overflow-hidden rounded-3xl bg-white border border-outline-variant/30 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >

                {/* CABECERA */}
                <div className="flex items-center gap-4 bg-primary/5 p-6">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white border border-outline-variant/30">

                    <span className="material-symbols-outlined text-4xl text-primary">
                      pets
                    </span>

                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-primary">
                      {mascota.nombre}
                    </h2>

                    <p className="text-sm text-on-surface-variant">
                      {mascota.tipo || 'Tipo no especificado'}
                    </p>
                  </div>

                </div>

                {/* INFORMACIÓN */}
                <div className="p-6 space-y-4">

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-surface-variant">
                      Raza
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {mascota.raza || 'No especificada'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-surface-variant">
                      Género
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {mascota.genero || 'No especificado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-surface-variant">
                      Edad
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {mascota.edad != null
                        ? `${mascota.edad} años`
                        : 'No especificada'}
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

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-surface-variant">
                      Altura
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {mascota.altura != null
                        ? `${mascota.altura} cm`
                        : 'No especificada'}
                    </span>
                  </div>

                  <div className="border-t border-outline-variant/30 pt-4">
                    <p className="text-xs text-on-surface-variant mb-1">
                      Alergias
                    </p>

                    <p className="text-sm font-medium text-gray-800">
                      {mascota.alergias || 'Sin alergias registradas'}
                    </p>
                  </div>

                  <div className="border-t border-outline-variant/30 pt-4 flex items-center justify-between gap-3">

                    <span className="text-xs text-on-surface-variant">
                      Código: #{mascota.id_mascota}
                    </span>

                    {/* BOTÓN EDITAR */}
                    <button
                      onClick={() => abrirEditar(mascota)}
                      className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-primary font-semibold hover:bg-primary hover:text-white transition"
                    >
                      <span className="material-symbols-outlined text-lg">
                        edit
                      </span>

                      Editar
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )
      )}

      {/* MODAL REGISTRO / EDICIÓN */}
      {modalAbierto && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* CABECERA DEL MODAL */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-primary px-6 py-5 text-white">

              <div>
                <h2 className="text-xl font-bold">
                  {editando !== null
                    ? 'Editar mascota'
                    : 'Registrar nueva mascota'}
                </h2>

                <p className="mt-1 text-sm text-white/80">
                  {editando !== null
                    ? 'Actualiza la información de tu mascota.'
                    : 'Completa los datos de tu compañero peludo.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                disabled={guardando}
                className="rounded-full p-2 hover:bg-white/20 transition"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>

            </div>

            {/* FORMULARIO */}
            <form
              onSubmit={handleGuardar}
              className="p-6 space-y-5"
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* NOMBRE */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nombre *
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Max"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* TIPO */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Tipo de mascota *
                  </label>

                  <select
                    name="tipo"
                    value={formulario.tipo}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* RAZA */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Raza
                  </label>

                  <input
                    type="text"
                    name="raza"
                    value={formulario.raza}
                    onChange={handleChange}
                    placeholder="Ej. Labrador"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary"
                  />
                </div>

                {/* GENERO */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Género *
                  </label>

                  <select
                    name="genero"
                    value={formulario.genero}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary"
                  >
                    <option value="">Seleccionar género</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>

                {/* EDAD */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Edad (años)
                  </label>

                  <input
                    type="number"
                    name="edad"
                    value={formulario.edad}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="Ej. 3"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary"
                  />
                </div>

                {/* PESO */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Peso (kg)
                  </label>

                  <input
                    type="number"
                    name="peso"
                    value={formulario.peso}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Ej. 12.5"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary"
                  />
                </div>

                {/* ALTURA */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Altura (cm)
                  </label>

                  <input
                    type="number"
                    name="altura"
                    value={formulario.altura}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="Ej. 45"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary"
                  />
                </div>

              </div>

              {/* ALERGIAS */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Alergias
                </label>

                <textarea
                  name="alergias"
                  value={formulario.alergias}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe las alergias de tu mascota o escribe Ninguna..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary resize-none"
                />
              </div>

              {/* BOTONES */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardando}
                  className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white hover:opacity-90 transition disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">
                    {guardando ? 'hourglass_empty' : 'save'}
                  </span>

                  {guardando
                    ? 'Guardando...'
                    : editando !== null
                      ? 'Guardar cambios'
                      : 'Registrar mascota'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
