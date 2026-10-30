import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { REQUIERE_2FA_KEY } from './requiere2fa.decorator';
import { TotpService } from '../segundo-factor/totp.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

const MENSAJES_2FA = {
  NO_ACTIVADO:
    'Esta operación requiere segundo factor y aún no lo has activado. Actívalo en la sección Seguridad.',
  FALTA_CODIGO: 'Operación sensible: ingresa el código de 6 dígitos de tu app autenticadora.',
  INVALIDO: 'El código de segundo factor es incorrecto o ya fue usado. Ingresa uno nuevo.',
  BLOQUEADO: 'Demasiados códigos incorrectos. Espera unos minutos antes de reintentar.',
} as const;

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly totp: TotpService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lee los roles definidos en el método o, si no hay, en el controller
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Denegar por defecto: toda ruta protegida debe declarar sus roles con @Roles()
    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      throw new ForbiddenException('Recurso sin roles asignados.');
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // Comparación sin distinguir mayúsculas/minúsculas
    const tipoUsuario = String(user?.tipo_usuario ?? '').toLowerCase();
    const permitido = rolesPermitidos
      .map((rol) => rol.toLowerCase())
      .includes(tipoUsuario);

    if (!permitido) {
      throw new ForbiddenException('No tienes permisos para este recurso.');
    }

    // Parte 2-e: segundo factor para las operaciones de mayor riesgo
    const requiere2fa = this.reflector.getAllAndOverride<boolean>(REQUIERE_2FA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiere2fa) {
      const codigo = String(request.headers?.['x-codigo-2fa'] ?? '').trim();
      const resultado = await this.totp.verificar(String(user.id_usuario), codigo);
      if (resultado !== 'OK') {
        // Pedir el código por primera vez no es un incidente; fallar o no tenerlo activado sí se audita
        if (resultado !== 'FALTA_CODIGO') {
          await this.auditoria.registrar({
            evento: '2FA_OPERACION_DENEGADA',
            recurso: `${request.method} ${String(request.originalUrl ?? '').split('?')[0]}`,
            resultado: 'DENEGADO',
            detalle: { motivo: resultado },
          });
        }
        throw new ForbiddenException({
          statusCode: 403,
          error: 'Forbidden',
          codigo: resultado === 'NO_ACTIVADO' ? '2FA_NO_ACTIVADO' : 'REQUIERE_2FA',
          message: MENSAJES_2FA[resultado],
        });
      }
    }

    return true;
  }
}
