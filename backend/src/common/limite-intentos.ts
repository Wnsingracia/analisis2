import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LimitadorVentana } from './limitador';
import { AuditoriaService } from '../auditoria/auditoria.service';

export const LIMITE_KEY = 'limite_intentos';

/** Parte 2-c: máximo de `max` peticiones por IP cada `ventanaMin` minutos en esa ruta. */
export const LimiteIntentos = (max: number, ventanaMin: number) =>
  SetMetadata(LIMITE_KEY, { max, ventanaMs: ventanaMin * 60_000 });

@Injectable()
export class LimiteIntentosGuard implements CanActivate {
  private readonly limitadores = new Map<string, LimitadorVentana>();

  constructor(
    private readonly reflector: Reflector,
    private readonly auditoria: AuditoriaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const cfg = this.reflector.get<{ max: number; ventanaMs: number }>(
      LIMITE_KEY,
      context.getHandler(),
    );
    if (!cfg) return true;

    const req = context.switchToHttp().getRequest();
    const ruta = `${context.getClass().name}.${context.getHandler().name}`;
    let limitador = this.limitadores.get(ruta);
    if (!limitador) {
      limitador = new LimitadorVentana(cfg.max, cfg.ventanaMs);
      this.limitadores.set(ruta, limitador);
    }

    const ip = String(req.ip ?? 'desconocida');
    if (limitador.excedido(ip)) {
      await this.auditoria.registrar({
        evento: 'LIMITE_PETICIONES_EXCEDIDO',
        recurso: ruta,
        resultado: 'DENEGADO',
        id_usuario: null,
        rol: null,
      });
      throw new HttpException(
        { statusCode: 429, error: 'Too Many Requests', message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
        429,
      );
    }
    limitador.registrar(ip);
    return true;
  }
}
