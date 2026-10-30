import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { LimitadorVentana } from '../common/limitador';
import { base32Encode, cifrar, descifrar, verificarTotp } from './totp.util';

export type ResultadoVerificacion = 'OK' | 'NO_ACTIVADO' | 'FALTA_CODIGO' | 'INVALIDO' | 'BLOQUEADO';

@Injectable()
export class TotpService {
  // Parte 2-c también para el 2.º factor: 5 códigos erróneos bloquean 5 minutos
  private readonly fallos = new LimitadorVentana(5, 5 * 60_000);

  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
    private readonly auditoria: AuditoriaService,
  ) {}

  async estado(idUsuario: string) {
    const u = await this.repo.findOne({
      where: { id_usuario: idUsuario },
      select: { id_usuario: true, totp_activo: true },
    });
    return { activo: !!u?.totp_activo };
  }

  /** Genera un secreto nuevo (aún inactivo). Se activa al confirmar un primer código. */
  async iniciarConfiguracion(idUsuario: string) {
    const u = await this.repo.findOne({
      where: { id_usuario: idUsuario },
      select: { id_usuario: true, correo: true, totp_activo: true },
    });
    if (!u) throw new UnauthorizedException('Sesión inválida.');
    if (u.totp_activo) {
      throw new ConflictException('El segundo factor ya está activo. Desactívalo primero para generar otro secreto.');
    }

    const secreto = base32Encode(crypto.randomBytes(20));
    await this.repo.update(idUsuario, { totp_secreto: cifrar(secreto), totp_ultimo_paso: null });

    const cuenta = encodeURIComponent(`VetCare:${u.correo}`);
    return {
      secreto,
      otpauth_uri: `otpauth://totp/${cuenta}?secret=${secreto}&issuer=VetCare&algorithm=SHA1&digits=6&period=30`,
    };
  }

  async activar(idUsuario: string, codigo: string) {
    const u = await this.cargar(idUsuario);
    if (!u.totp_secreto) throw new BadRequestException('Primero genera el secreto del segundo factor.');
    if (u.totp_activo) throw new ConflictException('El segundo factor ya está activo.');

    const r = await this.comprobar(u, codigo);
    if (r !== 'OK') {
      await this.auditoria.registrar({ evento: '2FA_ACTIVACION_FALLIDA', recurso: `usuarios/${idUsuario}`, resultado: 'DENEGADO' });
      throw new BadRequestException(r === 'BLOQUEADO' ? 'Demasiados intentos. Espera unos minutos.' : 'Código incorrecto.');
    }
    await this.repo.update(idUsuario, { totp_activo: true });
    await this.auditoria.registrar({ evento: '2FA_ACTIVADO', recurso: `usuarios/${idUsuario}` });
    return { mensaje: 'Segundo factor activado.' };
  }

  async desactivar(idUsuario: string, codigo: string) {
    const u = await this.cargar(idUsuario);
    if (!u.totp_activo) throw new BadRequestException('El segundo factor no está activo.');

    const r = await this.comprobar(u, codigo);
    if (r !== 'OK') {
      await this.auditoria.registrar({ evento: '2FA_DESACTIVACION_FALLIDA', recurso: `usuarios/${idUsuario}`, resultado: 'DENEGADO' });
      throw new BadRequestException(r === 'BLOQUEADO' ? 'Demasiados intentos. Espera unos minutos.' : 'Código incorrecto.');
    }
    await this.repo.update(idUsuario, { totp_activo: false, totp_secreto: null, totp_ultimo_paso: null });
    await this.auditoria.registrar({ evento: '2FA_DESACTIVADO', recurso: `usuarios/${idUsuario}` });
    return { mensaje: 'Segundo factor desactivado.' };
  }

  /** Lo usa RolesGuard para las rutas marcadas con @Requiere2FA(). */
  async verificar(idUsuario: string, codigo?: string): Promise<ResultadoVerificacion> {
    const u = await this.cargar(idUsuario);
    if (!u.totp_activo || !u.totp_secreto) return 'NO_ACTIVADO';
    if (!codigo) return 'FALTA_CODIGO';
    return this.comprobar(u, codigo);
  }

  // ---------- internos ----------

  private cargar(idUsuario: string) {
    return this.repo
      .findOne({
        where: { id_usuario: idUsuario },
        select: { id_usuario: true, totp_secreto: true, totp_activo: true, totp_ultimo_paso: true },
      })
      .then((u) => {
        if (!u) throw new UnauthorizedException('Sesión inválida.');
        return u;
      });
  }

  private async comprobar(u: Usuario, codigo: string): Promise<ResultadoVerificacion> {
    const clave = String(u.id_usuario);
    if (this.fallos.excedido(clave)) return 'BLOQUEADO';

    let paso: number | null = null;
    try {
      paso = verificarTotp(descifrar(u.totp_secreto as string), String(codigo ?? '').trim());
    } catch {
      paso = null; // secreto ilegible (p. ej. cambió TOTP_KEY): se trata como inválido
    }

    // Un código ya usado (mismo paso o anterior) se rechaza: evita repetición
    const repetido = paso !== null && u.totp_ultimo_paso !== null && paso <= Number(u.totp_ultimo_paso);
    if (paso === null || repetido) {
      this.fallos.registrar(clave);
      return 'INVALIDO';
    }

    this.fallos.reiniciar(clave);
    await this.repo.update(u.id_usuario, { totp_ultimo_paso: paso });
    return 'OK';
  }
}
