import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import {
  createPublicKey,
  randomBytes,
  randomUUID,
  verify,
} from 'crypto';

import { Dispositivo } from './entities/dispositivos.entity';

interface DesafioPayload {
  tipo: 'DEVICE_CHALLENGE';
  id_desafio: string;
  nonce: string;
  id_usuario: string;
  hash_token: string;
  id_dispositivo: string;
}

interface AutorizacionPayload {
  tipo: 'DEVICE_AUTHORIZATION';
  id_usuario: string;
  hash_token: string;
  id_dispositivo: string;
}

@Injectable()
export class DispositivosService {
  private readonly DURACION_DESAFIO = 120;
  private readonly DURACION_AUTORIZACION = 8 * 60 * 60;

  private readonly secret: string;

  constructor(
    @InjectRepository(Dispositivo)
    private readonly dispositivoRepo: Repository<Dispositivo>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('DEVICE_AUTH_SECRET');

    if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
      throw new InternalServerErrorException(
        'DEVICE_AUTH_SECRET no está configurada correctamente.',
      );
    }

    this.secret = secret;
  }

  // =====================================================
  // 1. REGISTRAR DISPOSITIVO
  // =====================================================

  async registrar(
    nombre: string,
    clavePublica: string,
  ) {
    if (!nombre?.trim() || !clavePublica?.trim()) {
      throw new BadRequestException(
        'Debes proporcionar el nombre y la clave pública.',
      );
    }

    const clave = clavePublica.trim();

    let claveBytes: Buffer;

    try {
      claveBytes = Buffer.from(clave, 'base64');
    } catch {
      throw new BadRequestException('La clave pública no es válida.');
    }

    if (
      claveBytes.length !== 32 ||
      claveBytes.toString('base64') !== clave
    ) {
      throw new BadRequestException(
        'La clave pública Ed25519 debe contener exactamente 32 bytes en Base64.',
      );
    }

    const existente = await this.dispositivoRepo.findOne({
      where: { clave_publica: clave },
    });

    if (existente) {
      throw new ConflictException(
        'Esta computadora ya está registrada.',
      );
    }

    const dispositivo = this.dispositivoRepo.create({
      nombre: nombre.trim(),
      clave_publica: clave,
      activo: true,
    });

    return this.dispositivoRepo.save(dispositivo);
  }

  // =====================================================
  // 2. LISTAR DISPOSITIVOS
  // =====================================================

  async listar() {
    return this.dispositivoRepo.find({
      select: {
        id_dispositivo: true,
        nombre: true,
        clave_publica: true,
        activo: true,
        fecha_registro: true,
      },
      order: {
        fecha_registro: 'DESC',
      },
    });
  }

  // =====================================================
  // 3. REVOCAR DISPOSITIVO
  // =====================================================

  async revocar(idDispositivo: string) {
    if (!/^\d+$/.test(idDispositivo)) {
      throw new BadRequestException('Identificador inválido.');
    }

    const dispositivo = await this.dispositivoRepo.findOne({
      where: { id_dispositivo: idDispositivo },
    });

    if (!dispositivo) {
      throw new NotFoundException(
        'No se encontró el dispositivo.',
      );
    }

    if (!dispositivo.activo) {
      throw new ConflictException(
        'El dispositivo ya está revocado.',
      );
    }

    dispositivo.activo = false;

    await this.dispositivoRepo.save(dispositivo);

    return {
      mensaje: 'Dispositivo revocado correctamente.',
    };
  }

  // =====================================================
  // 4. GENERAR DESAFÍO
  // =====================================================

  async crearDesafio(
    idUsuario: string,
    hashToken: string,
    idDispositivo: string,
  ) {
    if (
      !idUsuario ||
      !/^[a-f0-9]{64}$/i.test(hashToken) ||
      !/^\d+$/.test(idDispositivo)
    ) {
      throw new BadRequestException(
        'Los datos de la sesión o del dispositivo no son válidos.',
      );
    }

    const dispositivo = await this.dispositivoRepo.findOne({
      where: {
        id_dispositivo: idDispositivo,
        activo: true,
      },
    });

    if (!dispositivo) {
      throw new ForbiddenException(
        'El dispositivo no está autorizado.',
      );
    }

    const idDesafio = randomUUID();
    const nonce = randomBytes(32).toString('hex');

    const desafio: DesafioPayload = {
      tipo: 'DEVICE_CHALLENGE',
      id_desafio: idDesafio,
      nonce,
      id_usuario: idUsuario,
      hash_token: hashToken,
      id_dispositivo: idDispositivo,
    };

    const challengeToken = await this.jwtService.signAsync(
      desafio,
      {
        secret: this.secret,
        expiresIn: this.DURACION_DESAFIO,
        algorithm: 'HS256',
      },
    );

    return {
      idDesafio,
      nonce,
      challengeToken,
      expiraEnSegundos: this.DURACION_DESAFIO,
    };
  }

  // =====================================================
  // 5. VERIFICAR DISPOSITIVO
  // =====================================================

  async verificarDispositivo(
    idUsuario: string,
    hashToken: string,
    challengeToken: string,
    firma: string,
  ) {
    if (
      !idUsuario ||
      !/^[a-f0-9]{64}$/i.test(hashToken) ||
      !challengeToken ||
      !firma
    ) {
      throw new BadRequestException(
        'Faltan datos para verificar el dispositivo.',
      );
    }

    let desafio: DesafioPayload;

    try {
      desafio = await this.jwtService.verifyAsync<DesafioPayload>(
        challengeToken,
        {
          secret: this.secret,
          algorithms: ['HS256'],
        },
      );
    } catch {
      throw new UnauthorizedException(
        'El desafío es inválido o ha expirado.',
      );
    }

    if (
        !desafio ||
        desafio.tipo !== 'DEVICE_CHALLENGE' ||
        desafio.id_usuario !== idUsuario ||
        desafio.hash_token !== hashToken ||
        !/^[a-f0-9]{64}$/i.test(desafio.hash_token) ||
        !/^[a-f0-9]{64}$/i.test(desafio.nonce) ||
        !/^\d+$/.test(desafio.id_dispositivo) ||
        !/^[0-9a-f-]{36}$/i.test(desafio.id_desafio)
    ) {
        throw new UnauthorizedException(
            'El desafío no pertenece a esta sesión o contiene datos inválidos.',
        );
    }

    const dispositivo = await this.dispositivoRepo.findOne({
      where: {
        id_dispositivo: desafio.id_dispositivo,
        activo: true,
      },
    });

    if (!dispositivo) {
      throw new ForbiddenException(
        'El dispositivo fue revocado o no está registrado.',
      );
    }

    const clavePublicaBytes = Buffer.from(
      dispositivo.clave_publica,
      'base64',
    );

    if (clavePublicaBytes.length !== 32) {
      throw new ForbiddenException(
        'La clave pública registrada no es válida.',
      );
    }

    const prefijoSPKI = Buffer.from(
      '302a300506032b6570032100',
      'hex',
    );

    const clavePublica = createPublicKey({
      key: Buffer.concat([
        prefijoSPKI,
        clavePublicaBytes,
      ]),
      format: 'der',
      type: 'spki',
    });

    const mensaje = [
      'VETCARE-DEVICE-V1',
      desafio.id_desafio.toLowerCase(),
      desafio.nonce.toLowerCase(),
    ].join('\n');

    // Una firma Ed25519 de 64 bytes ocupa 86 caracteres
    // cuando se codifica en Base64URL sin padding.
    if (!/^[A-Za-z0-9_-]{86}$/.test(firma)) {
        throw new BadRequestException(
            'El formato de la firma no es válido.',
        );
    }

    const firmaBytes = Buffer.from(firma, 'base64url');

    if (
    firmaBytes.length !== 64 ||
    firmaBytes.toString('base64url') !== firma
    ) {
        throw new BadRequestException(
            'La firma tiene una codificación incorrecta.',
        );
    }

    const firmaValida = verify(
      null,
      Buffer.from(mensaje, 'utf8'),
      clavePublica,
      firmaBytes,
    );

    if (!firmaValida) {
      throw new ForbiddenException(
        'La firma no corresponde al dispositivo registrado.',
      );
    }

    // Comprobación adicional por si el dispositivo fue revocado
    // durante el proceso de verificación.
    const dispositivoActual = await this.dispositivoRepo.findOne({
      where: {
        id_dispositivo: desafio.id_dispositivo,
        activo: true,
      },
    });

    if (!dispositivoActual) {
      throw new ForbiddenException(
        'El dispositivo ya no está autorizado.',
      );
    }

    const autorizacion: AutorizacionPayload = {
      tipo: 'DEVICE_AUTHORIZATION',
      id_usuario: idUsuario,
      hash_token: hashToken,
      id_dispositivo: desafio.id_dispositivo,
    };

    const authorizationToken = await this.jwtService.signAsync(
      autorizacion,
      {
        secret: this.secret,
        expiresIn: this.DURACION_AUTORIZACION,
        algorithm: 'HS256',
      },
    );

    return {
      autorizado: true,
      authorizationToken,
      expiraEnSegundos: this.DURACION_AUTORIZACION,
      mensaje: 'Dispositivo verificado correctamente.',
    };
  }

  // =====================================================
  // 6. COMPROBAR AUTORIZACIÓN
  // =====================================================

  async sesionAutorizada(
    idUsuario: string,
    hashToken: string,
    authorizationToken: string,
  ): Promise<boolean> {
    if (!authorizationToken) {
      return false;
    }

    let autorizacion: AutorizacionPayload;

    try {
      autorizacion =
        await this.jwtService.verifyAsync<AutorizacionPayload>(
          authorizationToken,
          {
            secret: this.secret,
            algorithms: ['HS256'],
          },
        );
    } catch {
      return false;
    }

    if (
        !autorizacion ||
        autorizacion.tipo !== 'DEVICE_AUTHORIZATION' ||
        autorizacion.id_usuario !== idUsuario ||
        autorizacion.hash_token !== hashToken ||
        !/^[a-f0-9]{64}$/i.test(autorizacion.hash_token) ||
        !/^\d+$/.test(autorizacion.id_dispositivo)
    ) {
        return false;
    }

    const dispositivo = await this.dispositivoRepo.findOne({
    where: {
        id_dispositivo: autorizacion.id_dispositivo,
        activo: true,
    },
    });

    return !!dispositivo;
  }
}