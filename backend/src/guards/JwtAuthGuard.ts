import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface JwtPayload {
  id_usuario: string;
  tipo_usuario: string;
  correo: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
    .switchToHttp()
    .getRequest<Request & { user?: JwtPayload; cookies?: Record<string, string> }>();

    const [tipo, bearer] = request.headers.authorization?.split(' ') ?? [];
    const token = request.cookies?.vetcare_token ?? (tipo === 'Bearer' ? bearer : undefined);

    if (!token) {
      throw new UnauthorizedException('Debes iniciar sesión para acceder a este recurso.');
    }

    try {
      // Usa el secret configurado en JwtModule (JWT_SECRET)
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token, {
        algorithms: ['HS256'],
      });
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}