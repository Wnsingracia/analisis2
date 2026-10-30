import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Auditoria } from './entities/auditoria.entity';
import { contextoActual } from '../common/contexto';
import {
  BCRYPT_ROUNDS,
  CONTRASENIA_MAX,
  CONTRASENIA_MIN,
} from '../common/contrasenia';
import { HORAS_ACTIVA_EMERGENCIA, MINUTOS_SESION_EMERGENCIA } from '../common/emergencia';

export interface EventoAuditoria {
  evento: string; // p. ej. ALTA_IDENTIDAD, CAMBIO_ESTADO, BAJA_IDENTIDAD, CAMBIO_ROL
  recurso?: string; // p. ej. usuarios/100012
  resultado?: 'OK' | 'DENEGADO' | 'ERROR';
  id_usuario?: string | null; // actor; por defecto, el de la petición en curso
  rol?: string | null;
  detalle?: Record<string, unknown>;
}

@Injectable()
export class AuditoriaService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(Auditoria)
    private readonly repo: Repository<Auditoria>,
  ) {}

  /**
   * Con `manager` el evento se escribe dentro de la transacción del cambio:
   * si la auditoría falla, el cambio tampoco se aplica (no hay cambios sin rastro).
   * Sin `manager` es "mejor esfuerzo": un fallo se registra en el log pero no rompe la petición.
   */
  async registrar(ev: EventoAuditoria, manager?: EntityManager): Promise<void> {
    const ctx = contextoActual();
    const fila = {
      evento: ev.evento,
      recurso: ev.recurso ?? null,
      resultado: ev.resultado ?? 'OK',
      id_usuario: ev.id_usuario !== undefined ? ev.id_usuario : (ctx?.user?.id_usuario ?? null),
      rol: ev.rol !== undefined ? ev.rol : (ctx?.user?.tipo_usuario ?? null),
      ip: ctx?.ip ?? null,
      detalle: ev.detalle ?? null,
    };

    // Evita que el filtro global duplique un acceso denegado que ya quedó registrado
    if (ctx && fila.resultado === 'DENEGADO') ctx.denegadoRegistrado = true;

    if (manager) {
      await manager.insert(Auditoria, fila as any);
      return;
    }
    try {
      await this.repo.insert(fila as any);
    } catch (error) {
      this.logger.error(`No se pudo registrar el evento ${ev.evento}`, (error as Error)?.stack);
    }
  }

  listar(limite = 100, evento?: string) {
    const take = Math.min(Math.max(limite, 1), 500);
    const qb = this.repo.createQueryBuilder('a').orderBy('a.id_evento', 'DESC').take(take);
    if (evento) qb.where('a.evento ILIKE :e', { e: `%${evento.replace(/[%_]/g, '')}%` });
    return qb.getMany();
  }

  // ---------- Parte 4-f: cambios de configuración ----------

  /**
   * Al arrancar, guarda una "foto" de la configuración (sin secretos: de las claves solo una
   * huella) y la compara con la del arranque anterior. Si algo cambió, deja un evento
   * CONFIGURACION_CAMBIADA con las claves afectadas.
   */
  async onApplicationBootstrap() {
    try {
      await this.registrarArranque();
    } catch (error) {
      this.logger.error('No se pudo registrar el arranque', (error as Error)?.stack);
    }
  }

  private async registrarArranque() {
    const huella = (v?: string) =>
      v ? crypto.createHash('sha256').update(v).digest('hex').slice(0, 12) : null;
    const e = process.env;

    const config: Record<string, string | number | null> = {
      NODE_ENV: e.NODE_ENV ?? null,
      FRONTEND_URL: e.FRONTEND_URL ?? null,
      DB_HOST: e.DB_HOST ?? null,
      DB_PORT: e.DB_PORT ?? null,
      DB_DATABASE: e.DB_DATABASE ?? null,
      JWT_SECRET_huella: huella(e.JWT_SECRET),
      TOTP_KEY_huella: huella(e.TOTP_KEY),
      API_KEY_huella: huella(e.API_KEY),
      sesion_horas: 8,
      bcrypt_rondas: BCRYPT_ROUNDS,
      contrasenia_longitud: `${CONTRASENIA_MIN}-${CONTRASENIA_MAX}`,
      emergencia_ventana_horas: HORAS_ACTIVA_EMERGENCIA,
      emergencia_sesion_minutos: MINUTOS_SESION_EMERGENCIA,
    };

    const previo = await this.repo.findOne({
      where: { evento: 'SISTEMA_INICIADO' },
      order: { id_evento: 'DESC' },
    });
    const antes = ((previo?.detalle as any)?.config ?? null) as Record<string, unknown> | null;

    await this.registrar({
      evento: 'SISTEMA_INICIADO',
      id_usuario: null,
      rol: 'sistema',
      detalle: { config },
    });

    if (antes) {
      const cambios = Object.keys({ ...antes, ...config })
        .filter((k) => String(antes[k] ?? null) !== String(config[k] ?? null))
        .map((k) => ({ clave: k, antes: antes[k] ?? null, despues: config[k] ?? null }));
      if (cambios.length) {
        await this.registrar({
          evento: 'CONFIGURACION_CAMBIADA',
          id_usuario: null,
          rol: 'sistema',
          detalle: { cambios },
        });
      }
    }
  }
}
