import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Capturamos la cabecera 'Authorization: Bearer <TOKEN>'
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Debes incluir un token JWT válido para acceder a este recurso.');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Validamos el token con nuestra firma secreta
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'CLAVE_SUPER_SECRETA_VETCARE_2026'
      });
      
      // Inyectamos el objeto desencriptado dentro de la request para que los controladores lo usen
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}