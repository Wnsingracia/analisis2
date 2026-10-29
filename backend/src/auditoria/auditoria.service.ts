import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { contextoActual } from 'src/common/contexto';

export interface EventoAuditoria {
  evento: string; // p. ej. ALTA_IDENTIDAD, CAMBIO_ESTADO, BAJA_IDENTIDAD, CAMBIO_ROL
  recurso?: string; // p. ej. usuarios/100012
  resultado?: 'OK' | 'DENEGADO' | 'ERROR';
  id_usuario?: string | null; // actor; por defecto, el de la petición en curso
  rol?: string | null;
  detalle?: Record<string, unknown>;
}

@Injectable()
export class AuditoriaService {
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

  listar(limite = 100) {
    return this.repo.find({ order: { id_evento: 'DESC' }, take: Math.min(Math.max(limite, 1), 500) });
  }
}
