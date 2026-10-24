import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { JwtPayload } from '../guards/JwtAuthGuard';

/** Devuelve el payload del JWT que dejó JwtAuthGuard en request.user */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload =>
    ctx.switchToHttp().getRequest().user,
);

export const rolDe = (user: JwtPayload): string =>
  String(user?.tipo_usuario ?? '').toUpperCase();

export const idDe = (user: JwtPayload): string => String(user.id_usuario);

/** Pasa si el usuario accede a su propio id o si su rol tiene acceso total. */
export function exigirPropioORoles(
  user: JwtPayload,
  idSolicitado: string | number,
  rolesConAccesoTotal: string[],
): void {
  if (idDe(user) === String(idSolicitado)) return;
  if (!rolesConAccesoTotal.includes(rolDe(user))) {
    throw new ForbiddenException('No tienes permisos para este recurso.');
  }
}
