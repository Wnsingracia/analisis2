import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuditoriaService } from './auditoria.service';
import { contextoActual } from '../common/contexto';

const ACCION: Record<string, string> = {
  POST: 'CREAR',
  PUT: 'MODIFICAR',
  PATCH: 'MODIFICAR',
  DELETE: 'ELIMINAR',
};

/**
 * Parte 4-c: registra TODA operación que modifica datos (alta, cambio o baja) con quién,
 * qué ruta, desde qué IP y con qué resultado. De los datos enviados guarda solo los
 * NOMBRES de los campos, nunca sus valores (así no se filtran contraseñas ni datos personales).
 * Si la cuenta es de emergencia, registra además TODAS sus peticiones, también las de lectura.
 */
@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(private readonly auditoria: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const req = http.getRequest();
    const metodo = String(req.method ?? '').toUpperCase();
    const ruta = String(req.originalUrl ?? req.url ?? '').split('?')[0];
    const mutante = metodo in ACCION;
    const emergencia = !!contextoActual()?.user?.emergencia;

    // /auth/* ya genera sus propios eventos (LOGIN_*, LOGOUT, 2FA_*...)
    if (ruta.startsWith('/auth/') || (!mutante && !emergencia)) return next.handle();

    const modulo = (ruta.split('/')[1] || 'RAIZ').toUpperCase();
    const evento = emergencia ? 'EMERGENCIA_USO' : `${ACCION[metodo]}_${modulo}`;
    const campos =
      req.body && typeof req.body === 'object' ? Object.keys(req.body).slice(0, 30) : [];

    const registrar = (resultado: 'OK' | 'DENEGADO' | 'ERROR', estado: number, motivo?: string) =>
      void this.auditoria.registrar({
        evento,
        recurso: `${metodo} ${ruta}`,
        resultado,
        detalle: {
          metodo,
          ruta,
          estado_http: estado,
          ...(Object.keys(req.params ?? {}).length ? { parametros: req.params } : {}),
          ...(campos.length ? { campos } : {}),
          ...(motivo ? { motivo } : {}),
          ...(emergencia ? { cuenta_emergencia: true } : {}),
        },
      });

    return next.handle().pipe(
      tap(() => registrar('OK', http.getResponse().statusCode)),
      catchError((error) => {
        const estado = error instanceof HttpException ? error.getStatus() : 500;
        const resultado = estado === 401 || estado === 403 ? 'DENEGADO' : 'ERROR';
        registrar(resultado, estado, String(error?.message ?? '').slice(0, 200));
        return throwError(() => error);
      }),
    );
  }
}
