import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionSistema } from './entities/configuracion-sistema.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { MODOS, ModoSistema } from './dto/modo.dto';

const CLAVE = 'modo';
const TTL_MS = 3000; // el modo se relee de la base como máximo cada 3 s

// Contenido clínico: se congela en el modo EXPEDIENTES_CONGELADOS
const RUTAS_EXPEDIENTES = [/^\/consultas(\/|$)/, /^\/tratamientos(\/|$)/, /^\/mascotas(\/|$)/];

// Operaciones de CONTENCIÓN: siguen permitidas incluso en SOLO_LECTURA, porque son las que
// permiten responder al incidente (entrar, suspender una cuenta, cerrar sesiones, cambiar de modo).
const RUTAS_CONTENCION = [
  /^\/auth\/(login|logout|recuperar|restablecer|2fa\/[a-z]+)$/,
  /^\/sistema\/modo$/,
  /^\/respaldos\/generar(-drive)?$/, // solo leen la base: se permiten en cualquier modo
  /^\/usuarios\/\d+\/(estado|revocar-sesiones)$/,
];

export interface EstadoModo {
  modo: ModoSistema;
  motivo: string | null;
  fecha: Date | null;
}

@Injectable()
export class ModoSistemaService {
  private readonly logger = new Logger(ModoSistemaService.name);
  private cache: { valor: EstadoModo; hasta: number } | null = null;

  constructor(
    @InjectRepository(ConfiguracionSistema)
    private readonly repo: Repository<ConfiguracionSistema>,
    private readonly auditoria: AuditoriaService,
  ) {}

  async obtener(): Promise<EstadoModo> {
    if (this.cache && this.cache.hasta > Date.now()) return this.cache.valor;

    let valor: EstadoModo = { modo: 'NORMAL', motivo: null, fecha: null };
    try {
      const fila = await this.repo.findOne({ where: { clave: CLAVE } });
      if (fila && (MODOS as readonly string[]).includes(fila.valor)) {
        valor = { modo: fila.valor as ModoSistema, motivo: fila.motivo, fecha: fila.fecha };
      }
    } catch (error) {
      // Si no se puede leer (p. ej. la base no responde) tampoco habría servicio: se asume NORMAL
      this.logger.error('No se pudo leer el modo del sistema; se asume NORMAL', (error as Error)?.stack);
    }
    this.cache = { valor, hasta: Date.now() + TTL_MS };
    return valor;
  }

  /** ¿Se permite esta petición en el modo indicado? */
  permite(metodo: string, ruta: string, modo: ModoSistema): boolean {
    if (modo === 'NORMAL') return true;
    if (['GET', 'HEAD', 'OPTIONS'].includes(metodo)) return true; // leer nunca se bloquea
    if (RUTAS_CONTENCION.some((r) => r.test(ruta))) return true;
    if (modo === 'EXPEDIENTES_CONGELADOS') {
      return !RUTAS_EXPEDIENTES.some((r) => r.test(ruta));
    }
    return false; // SOLO_LECTURA: toda escritura no esencial queda bloqueada
  }

  async cambiar(modo: ModoSistema, motivo: string, actor?: string): Promise<EstadoModo> {
    this.cache = null;
    const previo = await this.obtener();
    if (previo.modo === modo) {
      throw new ConflictException(`El sistema ya está en modo ${modo}.`);
    }

    await this.repo.upsert(
      {
        clave: CLAVE,
        valor: modo,
        motivo: motivo.trim(),
        actualizado_por: actor ?? null,
        fecha: new Date(),
      } as any,
      ['clave'],
    );
    this.cache = null;

    // Parte 4-f: un cambio de configuración en caliente, auditado
    await this.auditoria.registrar({
      evento: 'MODO_SISTEMA_CAMBIADO',
      recurso: 'sistema/modo',
      detalle: { modo_anterior: previo.modo, modo_nuevo: modo, motivo: motivo.trim() },
    });
    return this.obtener();
  }
}
