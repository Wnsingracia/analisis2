import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ModoSistemaService } from './modo-sistema.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

const MENSAJES = {
  EXPEDIENTES_CONGELADOS:
    'El sistema está en modo EXPEDIENTES CONGELADOS: no se pueden crear, modificar ni eliminar consultas, tratamientos ni mascotas. La consulta sigue disponible.',
  SOLO_LECTURA:
    'El sistema está en modo SOLO LECTURA por un incidente de seguridad: las modificaciones están bloqueadas temporalmente. La consulta sigue disponible.',
} as const;

/** Guard global: aplica el modo de operación a toda petición que modifica datos. */
@Injectable()
export class ModoSistemaGuard implements CanActivate {
  constructor(
    private readonly modos: ModoSistemaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;

    const req = context.switchToHttp().getRequest();
    const metodo = String(req.method ?? '').toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(metodo)) return true; // sin consulta a la base

    const ruta = String(req.originalUrl ?? req.url ?? '').split('?')[0].replace(/\/+$/, '') || '/';
    const { modo } = await this.modos.obtener();
    if (this.modos.permite(metodo, ruta, modo)) return true;

    await this.auditoria.registrar({
      evento: 'OPERACION_BLOQUEADA_POR_MODO',
      recurso: `${metodo} ${ruta}`,
      resultado: 'DENEGADO',
      id_usuario: null,
      rol: null,
      detalle: { modo },
    });
    throw new ServiceUnavailableException({
      statusCode: 503,
      error: 'Service Unavailable',
      codigo: `MODO_${modo}`,
      message: MENSAJES[modo as keyof typeof MENSAJES],
    });
  }
}
