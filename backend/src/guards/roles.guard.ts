import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lee los roles definidos en el método o, si no hay, en el controller
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Denegar por defecto: toda ruta protegida debe declarar sus roles con @Roles()
    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      throw new ForbiddenException('Recurso sin roles asignados.');
    }

    const { user } = context.switchToHttp().getRequest();

    // Comparación sin distinguir mayúsculas/minúsculas
    const tipoUsuario = String(user?.tipo_usuario ?? '').toLowerCase();
    const permitido = rolesPermitidos
      .map((rol) => rol.toLowerCase())
      .includes(tipoUsuario);

    if (!permitido) {
      throw new ForbiddenException('No tienes permisos para este recurso.');
    }

    return true;
  }
}
