import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { AuditoriaService } from './auditoria.service';
import { contextoActual } from '../common/contexto';

/**
 * Parte 4-d: registra los accesos denegados (401 y 403) que no tengan ya un evento más
 * específico (cuenta inactiva, 2.º factor, límite de peticiones...). Después deja que Nest
 * responda como siempre: no cambia ninguna respuesta.
 */
@Catch(HttpException)
export class AuditoriaExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly auditoria: AuditoriaService) {
    super();
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    if (host.getType() === 'http') {
      const estado = exception.getStatus();
      if (estado === 401 || estado === 403) void this.registrar(host, exception, estado);
    }
    super.catch(exception, host);
  }

  private async registrar(host: ArgumentsHost, exception: HttpException, estado: number) {
    try {
      // Ya hay un evento DENEGADO más preciso para esta petición
      if (contextoActual()?.denegadoRegistrado) return;

      const req = host.switchToHttp().getRequest();
      // Un 401 sin ninguna credencial (visita anónima, /auth/me al abrir el login) no es un incidente
      const traeCredenciales = !!req.cookies?.vetcare_token || !!req.headers?.authorization;
      if (estado === 401 && !traeCredenciales) return;

      const cuerpo = exception.getResponse() as any;
      const mensaje = Array.isArray(cuerpo?.message)
        ? cuerpo.message.join('; ')
        : (cuerpo?.message ?? String(cuerpo));

      await this.auditoria.registrar({
        evento: estado === 401 ? 'ACCESO_NO_AUTENTICADO' : 'ACCESO_DENEGADO',
        recurso: `${req.method} ${String(req.originalUrl ?? '').split('?')[0]}`,
        resultado: 'DENEGADO',
        detalle: { estado_http: estado, motivo: String(mensaje).slice(0, 200) },
      });
    } catch {
      /* la auditoría nunca debe romper la respuesta de error */
    }
  }
}
