import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { Usuario } from '../usuarios/entities/usuario.entity';

const MAX_INTENTOS_FALLIDOS = 5;
const MINUTOS_BLOQUEO = 15;
const MINUTOS_VALIDEZ_TOKEN = 15;
const SALT_ROUNDS = 10;
const LONGITUD_MIN_CONTRASENIA = 6;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.API_KEY,
      },
    });
  }

  // ---------- Utilidades ----------

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ---------- Login ----------

  async login(credenciales: { correo: string; contrasenia: string }) {
    const { correo, contrasenia } = credenciales ?? {};

    // Evita que findOne({ correo: undefined }) devuelva un usuario cualquiera
    if (!correo || !contrasenia) {
      throw new BadRequestException('Correo y contraseña son obligatorios');
    }

    const usuario = await this.usuarioRepo.findOne({ where: { correo } });

    if (!usuario || !usuario.contrasenia) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // 1. Verificar si la cuenta está bloqueada
    if (usuario.bloqueado_hasta) {
      const hasta = new Date(usuario.bloqueado_hasta);
      if (hasta > new Date()) {
        const minutosRestantes = Math.ceil(
          (hasta.getTime() - Date.now()) / 60000,
        );
        throw new ForbiddenException(
          `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutosRestantes} minuto(s).`,
        );
      }
    }

    // 2. Validar contraseña
    const contraseniaEsValida = await bcrypt.compare(
      contrasenia,
      usuario.contrasenia,
    );

    if (!contraseniaEsValida) {
      // Number() por seguridad: pg devuelve int8 como string
      const intentos = Number(usuario.intentos_fallidos ?? 0) + 1;

      if (intentos >= MAX_INTENTOS_FALLIDOS) {
        const bloqueadoHasta = new Date(
          Date.now() + MINUTOS_BLOQUEO * 60 * 1000,
        );
        await this.usuarioRepo.update(usuario.id_usuario, {
          intentos_fallidos: 0,
          bloqueado_hasta: bloqueadoHasta.toISOString(),
        });
        throw new ForbiddenException(
          `Demasiados intentos fallidos. Cuenta bloqueada por ${MINUTOS_BLOQUEO} minutos.`,
        );
      }

      await this.usuarioRepo.update(usuario.id_usuario, {
        intentos_fallidos: intentos,
      });
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // 3. Login correcto: limpiar contadores solo si hace falta
    if (Number(usuario.intentos_fallidos ?? 0) > 0 || usuario.bloqueado_hasta) {
      await this.usuarioRepo.update(usuario.id_usuario, {
        intentos_fallidos: 0,
        bloqueado_hasta: null,
      });
    }

    const payload = {
      id_usuario: usuario.id_usuario,
      tipo_usuario: usuario.tipo_usuario,
      correo: usuario.correo,
    };

    return {
      mensaje: 'Inicio de sesión correcto',
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id_usuario: usuario.id_usuario,
        nombres: usuario.nombres,
        ap_pat: usuario.ap_pat,
        tipo_usuario: usuario.tipo_usuario,
      },
    };
  }

  // ---------- Recuperación de contraseña ----------

  async solicitarRecuperacion(correo: string) {
    const respuestaGenerica = {
      mensaje:
        'Si el correo está registrado, se enviará un enlace de restablecimiento en breve.',
    };

    if (!correo) {
      throw new BadRequestException('El correo es obligatorio');
    }

    const usuario = await this.usuarioRepo.findOne({ where: { correo } });
    if (!usuario) {
      return respuestaGenerica;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expira = new Date(Date.now() + MINUTOS_VALIDEZ_TOKEN * 60 * 1000);

    await this.usuarioRepo.update(usuario.id_usuario, {
      reset_token: tokenHash,
      reset_token_expira: expira.toISOString(),
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const enlaceRecuperacion = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: 'VetCare <onboarding@resend.dev>',
        to: correo,
        subject: '🔄 Restablece tu contraseña de VetCare',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 16px;">
            <h2 style="color: #0d9488; font-size: 22px; margin-bottom: 10px;">¡Hola desde VetCare! 🐾</h2>
            <p style="color: #71717a; font-size: 14px; line-height: 1.5;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p style="color: #71717a; font-size: 14px; line-height: 1.5;">Para continuar, haz clic en el siguiente botón seguro. Este enlace tiene una validez de <strong>${MINUTOS_VALIDEZ_TOKEN} minutos</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${enlaceRecuperacion}" style="background-color: #0d9488; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; font-size: 14px; display: inline-block;">Restablecer Contraseña</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
            <p style="color: #a1a1aa; font-size: 11px; text-align: center;">Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          </div>
        `,
      });

      return respuestaGenerica;
    } catch (error) {
      this.logger.error('Error enviando correo de recuperación', error as Error);

      await this.usuarioRepo.update(usuario.id_usuario, {
        reset_token: null,
        reset_token_expira: null,
      });

      throw new InternalServerErrorException(
        'No se pudo enviar el correo de recuperación.',
      );
    }
  }

  async restablecerContrasenia(token: string, nuevaContrasenia: string) {
    // Evita que findOne({ reset_token: undefined }) devuelva un usuario cualquiera
    if (!token) {
      throw new BadRequestException('El token de recuperación es obligatorio.');
    }

    if (
      !nuevaContrasenia ||
      nuevaContrasenia.length < LONGITUD_MIN_CONTRASENIA
    ) {
      throw new BadRequestException(
        `La contraseña debe tener por lo menos ${LONGITUD_MIN_CONTRASENIA} caracteres.`,
      );
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { reset_token: this.hashToken(token) },
    });

    if (!usuario || !usuario.reset_token_expira) {
      throw new BadRequestException('El token de recuperación es inválido.');
    }

    if (new Date() > new Date(usuario.reset_token_expira)) {
      // Limpiar token vencido
      await this.usuarioRepo.update(usuario.id_usuario, {
        reset_token: null,
        reset_token_expira: null,
      });
      throw new BadRequestException(
        'El token ha expirado. Por favor, solicita uno nuevo desde la web.',
      );
    }

    const contraseniaHasheada = await bcrypt.hash(
      nuevaContrasenia,
      SALT_ROUNDS,
    );

    await this.usuarioRepo.update(usuario.id_usuario, {
      contrasenia: contraseniaHasheada,
      reset_token: null,
      reset_token_expira: null,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
    });

    return { mensaje: 'Tu contraseña ha sido actualizada con éxito.' };
  }
}