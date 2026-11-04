
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DispositivosService } from './dispositivos.service';

interface RequestConDispositivo {
  method: string;
  headers: {
    'x-device-authorization'?: string | string[];
  };
  user?: {
    id_usuario: string;
    tipo_usuario: string;
  };
  deviceSessionHash?: string;
}

@Injectable()
export class DispositivoGuard implements CanActivate {
  constructor(
    private readonly dispositivosService: DispositivosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestConDispositivo>();

    // Los métodos de consulta no requieren autorización del dispositivo.
    const metodosLectura = ['GET', 'HEAD', 'OPTIONS'];

    if (metodosLectura.includes(request.method.toUpperCase())) {
      return true;
    }

    // Los demás roles mantienen sus permisos actuales.
    if (request.user?.tipo_usuario?.toUpperCase() !== 'RECEPCIONISTA') {
      return true;
    }

    const idUsuario = request.user.id_usuario;
    const hashSesion = request.deviceSessionHash;

    const encabezado = request.headers['x-device-authorization'];

    const tokenAutorizacion = Array.isArray(encabezado)
      ? encabezado[0]
      : encabezado;

    if (!hashSesion || !tokenAutorizacion) {
      throw new ForbiddenException(
        'Este dispositivo no está autorizado para realizar modificaciones.',
      );
    }

    const autorizado =
      await this.dispositivosService.sesionAutorizada(
        idUsuario,
        hashSesion,
        tokenAutorizacion,
      );

    if (!autorizado) {
      throw new ForbiddenException(
        'La sesión no tiene autorización desde un dispositivo registrado.',
      );
    }

    return true;
  }
}
