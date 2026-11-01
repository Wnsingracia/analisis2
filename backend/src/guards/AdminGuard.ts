
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import type { Request } from 'express';
import type { JwtPayload } from './JwtAuthGuard';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    const usuario = request.user;

    if (
      !usuario ||
      String(usuario.tipo_usuario).toUpperCase() !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'No tienes permisos para administrar los respaldos.',
      );
    }

    return true;
  }
}
