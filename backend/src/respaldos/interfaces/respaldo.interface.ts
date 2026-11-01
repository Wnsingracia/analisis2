
export interface ResultadoRespaldo {
  exitoso: boolean;
  nombre: string;
  fecha: string;
  ruta: string;
  tamanoBytes: number;
  mensaje: string;
}

export interface EstadoRespaldo {
  ultimoRespaldo: string | null;
  cantidadRespaldos: number;
  directorio: string;
}
