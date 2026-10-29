import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { contextoActual } from '../common/contexto';

export interface JwtPayload {
  id_usuario: string;
  tipo_usuario: string;
  correo: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload; cookies?: Record<string, string> }>();

    const [tipo, bearer] = request.headers.authorization?.split(' ') ?? [];
    const token = request.cookies?.vetcare_token ?? (tipo === 'Bearer' ? bearer : undefined);

    if (!token) {
      throw new UnauthorizedException('Debes iniciar sesión para acceder a este recurso.');
    }

    let payload: JwtPayload;
    try {
      // Usa el secret configurado en JwtModule (JWT_SECRET)
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    // La firma del token solo prueba que lo emitimos nosotros; el estado y el rol
    // vigentes se leen de la base de datos en cada petición. Así una identidad
    // suspendida, revocada o eliminada deja de operar de inmediato (no a las 8 h)
    // y un cambio de rol se aplica al instante.
    const actual = await this.dataSource.getRepository(Usuario).findOne({
      where: { id_usuario: String(payload.id_usuario) },
      select: { id_usuario: true, tipo_usuario: true, estado: true, correo: true },
    });

    if (!actual) {
      throw new UnauthorizedException('Sesión inválida.');
    }

    if (actual.estado !== 'ACTIVA') {
      await this.auditoria.registrar({
        evento: 'ACCESO_IDENTIDAD_INACTIVA',
        recurso: `${request.method} ${request.originalUrl?.split('?')[0] ?? ''}`,
        resultado: 'DENEGADO',
        id_usuario: actual.id_usuario,
        rol: actual.tipo_usuario,
        detalle: { estado: actual.estado },
      });
      throw new UnauthorizedException('Tu cuenta no está activa. Contacta al administrador.');
    }

    request.user = { ...payload, tipo_usuario: actual.tipo_usuario, correo: actual.correo };

    // El contexto de la petición permite a la auditoría saber quién actúa
    const ctx = contextoActual();
    if (ctx) {
      ctx.user = {
        id_usuario: String(actual.id_usuario),
        tipo_usuario: actual.tipo_usuario,
        correo: actual.correo,
      };
    }
    return true;
  }
}
