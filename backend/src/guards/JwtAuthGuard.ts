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
import { emergenciaVencida, expirarEmergencia } from '../common/emergencia';

export interface JwtPayload {
  id_usuario: string;
  tipo_usuario: string;
  correo: string;
  tv?: number; // versión del token (revocación de sesiones)
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
      select: {
        id_usuario: true,
        tipo_usuario: true,
        estado: true,
        correo: true,
        token_version: true,
        es_emergencia: true,
        fecha_estado: true,
      },
    });

    if (!actual) {
      throw new UnauthorizedException('Sesión inválida.');
    }

    // Cuenta de emergencia: su ventana de uso es corta; al vencer se vuelve a suspender sola
    if (emergenciaVencida(actual)) {
      await expirarEmergencia(this.dataSource.getRepository(Usuario), this.auditoria, actual.id_usuario);
      throw new UnauthorizedException(
        'La ventana de la cuenta de emergencia terminó y se suspendió automáticamente.',
      );
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

    // Parte 2-d: revocación de sesiones. Cerrar sesión, cambiar la contraseña o que un
    // admin "cierre las sesiones" sube token_version y los tokens anteriores dejan de valer.
    if (Number(payload.tv ?? 0) !== Number(actual.token_version ?? 0)) {
      await this.auditoria.registrar({
        evento: 'SESION_REVOCADA_RECHAZADA',
        recurso: `${request.method} ${request.originalUrl?.split('?')[0] ?? ''}`,
        resultado: 'DENEGADO',
        id_usuario: actual.id_usuario,
        rol: actual.tipo_usuario,
      });
      throw new UnauthorizedException('Tu sesión fue cerrada o revocada. Inicia sesión de nuevo.');
    }

    request.user = { ...payload, tipo_usuario: actual.tipo_usuario, correo: actual.correo };

    // El contexto de la petición permite a la auditoría saber quién actúa
    const ctx = contextoActual();
    if (ctx) {
      ctx.user = {
        id_usuario: String(actual.id_usuario),
        tipo_usuario: actual.tipo_usuario,
        correo: actual.correo,
        emergencia: actual.es_emergencia,
      };
    }
    return true;
  }
}
