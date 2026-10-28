import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface ClienteOpcion {
  id_usuario: string;
  nit?: string | null;
  usuario?: {
    nombres?: string | null;
    ap_pat?: string | null;
    ap_mat?: string | null;
    correo?: string | null;
    cel?: string | number | null;
  };
}

interface Props {
  clientes: ClienteOpcion[];
  value: string; // id_usuario del cliente elegido ('' si no hay)
  onChange: (idCliente: string) => void;
  onNuevoCliente: (textoBuscado: string) => void;
  cargando?: boolean;
}

// "Pérez" y "perez" deben coincidir
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const nombreDe = (c: ClienteOpcion) =>
  [c.usuario?.nombres, c.usuario?.ap_pat, c.usuario?.ap_mat].filter(Boolean).join(' ') ||
  `Cliente #${c.id_usuario}`;

export default function ClienteCombobox({ clientes, value, onChange, onNuevoCliente, cargando = false }: Props) {
  const idBase = useId();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState('');
  const [activo, setActivo] = useState(0);

  const seleccionado = useMemo(
    () => clientes.find((c) => c.id_usuario === value),
    [clientes, value],
  );

  // Busca por nombre, apellidos, correo, celular, NIT o id. Todas las palabras deben coincidir.
  const resultados = useMemo(() => {
    const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
    const lista =
      palabras.length === 0
        ? clientes
        : clientes.filter((c) => {
            const texto = normalizar(
              [nombreDe(c), c.usuario?.correo, c.usuario?.cel, c.nit, c.id_usuario]
                .filter(Boolean)
                .join(' '),
            );
            return palabras.every((p) => texto.includes(p));
          });
    return lista.slice(0, 50);
  }, [clientes, consulta]);

  const total = resultados.length + 1; // +1: "Registrar nuevo cliente"

  // Cierra al hacer clic fuera
  useEffect(() => {
    const fuera = (e: MouseEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) {
        setAbierto(false);
        setConsulta('');
      }
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, []);

  // Mantiene visible la opción activa al navegar con el teclado
  useEffect(() => {
    if (abierto) listaRef.current?.children[activo]?.scrollIntoView({ block: 'nearest' });
  }, [activo, abierto]);

  const abrir = () => {
    if (abierto) return;
    setAbierto(true);
    setConsulta('');
    setActivo(0);
  };

  const elegir = (id: string) => {
    onChange(id);
    setAbierto(false);
    setConsulta('');
  };

  const crearNuevo = () => {
    const texto = consulta.trim();
    setAbierto(false);
    setConsulta('');
    onNuevoCliente(texto);
  };

  const manejarTeclas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAbierto(true);
      setActivo((i) => Math.min(i + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && abierto) {
      e.preventDefault(); // no enviar el formulario de la cita
      if (activo < resultados.length) elegir(resultados[activo].id_usuario);
      else crearNuevo();
    } else if (e.key === 'Escape' && abierto) {
      e.stopPropagation(); // no cerrar el modal de la cita
      setAbierto(false);
      setConsulta('');
    }
  };

  const textoVisible = abierto ? consulta : seleccionado ? nombreDe(seleccionado) : '';
  const placeholder = cargando
    ? 'Cargando dueños...'
    : seleccionado
      ? nombreDe(seleccionado)
      : 'Escribe para buscar o selecciona un dueño';

  return (
    <div ref={contenedorRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={`${idBase}-lista`}
        aria-autocomplete="list"
        aria-activedescendant={abierto ? `${idBase}-op-${activo}` : undefined}
        autoComplete="off"
        value={textoVisible}
        placeholder={placeholder}
        onFocus={abrir}
        onClick={abrir}
        onChange={(e) => {
          setConsulta(e.target.value);
          setAbierto(true);
          setActivo(0);
        }}
        onKeyDown={manejarTeclas}
        className="w-full p-3.5 pr-10 border border-outline-variant rounded-lg bg-white text-sm focus:border-primary outline-none"
      />

      {value && !abierto ? (
        <button
          type="button"
          aria-label="Quitar dueño seleccionado"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      ) : (
        <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
          expand_more
        </span>
      )}

      {abierto && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-auto bg-white border border-outline-variant rounded-lg shadow-ambient">
          {resultados.length === 0 && (
            <p className="px-4 py-3 text-sm italic text-on-surface-variant">
              {clientes.length === 0 ? 'Aún no hay clientes registrados.' : 'Ningún cliente coincide con la búsqueda.'}
            </p>
          )}

          <ul ref={listaRef} id={`${idBase}-lista`} role="listbox">
            {resultados.map((c, i) => (
              <li
                key={c.id_usuario}
                id={`${idBase}-op-${i}`}
                role="option"
                aria-selected={c.id_usuario === value}
                onMouseDown={(e) => e.preventDefault()} // conserva el foco del input
                onMouseEnter={() => setActivo(i)}
                onClick={() => elegir(c.id_usuario)}
                className={`px-4 py-2.5 cursor-pointer ${i === activo ? 'bg-primary/10' : ''}`}
              >
                <p className="text-sm font-bold text-on-surface">{nombreDe(c)}</p>
                <p className="text-xs text-on-surface-variant">
                  {[c.usuario?.correo, c.usuario?.cel, `ID: ${c.id_usuario}`].filter(Boolean).join(' • ')}
                </p>
              </li>
            ))}

            <li
              id={`${idBase}-op-${resultados.length}`}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActivo(resultados.length)}
              onClick={crearNuevo}
              className={`px-4 py-3 cursor-pointer border-t border-outline-variant/40 flex items-center gap-2 text-primary font-bold text-sm ${
                activo === resultados.length ? 'bg-primary/10' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              {consulta.trim() ? `Registrar nuevo cliente "${consulta.trim()}"` : 'Registrar nuevo cliente'}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}