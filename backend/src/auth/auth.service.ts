import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { TurnstileService } from './turnstile.service';
import {
  BCRYPT_ROUNDS,
  HASH_FALSO,
  MENSAJE_POLITICA,
  cumplePolitica,
} from '../common/contrasenia';
import {
  MINUTOS_SESION_EMERGENCIA,
  emergenciaVencida,
  expirarEmergencia,
} from '../common/emergencia';

const MAX_INTENTOS_FALLIDOS = 5;
const MINUTOS_BLOQUEO = 15;
const MINUTOS_VALIDEZ_TOKEN = 15;

// Parte 2-f: UN solo mensaje para correo inexistente, contraseña errónea y cuenta
// bloqueada. Así nadie puede averiguar qué correos tienen cuenta.
const MENSAJE_LOGIN = 'Correo o contraseña incorrectos, o cuenta bloqueada temporalmente.';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly auditoria: AuditoriaService,
    private readonly turnstileService: TurnstileService,
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

  // bcrypt.compare puede lanzar con un hash mal formado: se trata como "no coincide"
  private async comparar(clave: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(clave, hash);
    } catch {
      return false;
    }
  }

  // ---------- Login ----------

  async login(credenciales: { correo: string; contrasenia: string; captchaToken: string }) {
    const { correo, contrasenia, captchaToken } = credenciales ?? {};

    // 1. Verificar CAPTCHA antes de consultar la base de datos
    await this.turnstileService.verificarCaptcha(captchaToken);

    // Evita que findOne({ correo: undefined }) devuelva un usuario cualquiera
    if (!correo || !contrasenia) {
      throw new BadRequestException('Correo y contraseña son obligatorios');
    }

    const usuario = await this.usuarioRepo.findOne({ where: { correo } });

    const bloqueada =
      !!usuario?.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date();
    const puedeComparar = !!usuario && !!usuario.contrasenia && !bloqueada;

    // Siempre se ejecuta UN bcrypt.compare (contra el hash real o uno descartable):
    // el tiempo de respuesta no revela si el correo existe ni si está bloqueado.
    const contraseniaEsValida = await this.comparar(
      contrasenia,
      puedeComparar ? (usuario!.contrasenia as string) : HASH_FALSO,
    );

    if (!puedeComparar) {
      await this.auditoria.registrar({
        evento: 'LOGIN_FALLIDO',
        recurso: usuario ? `usuarios/${usuario.id_usuario}` : null as any,
        resultado: 'DENEGADO',
        id_usuario: usuario?.id_usuario ?? null,
        rol: usuario?.tipo_usuario ?? null,
        detalle: { motivo: !usuario ? 'correo_desconocido' : bloqueada ? 'cuenta_bloqueada' : 'sin_contrasenia', correo_intentado: correo },
      });
      throw new UnauthorizedException(MENSAJE_LOGIN);
    }

    if (!contraseniaEsValida) {
      // Number() por seguridad: pg devuelve int8 como string
      const intentos = Number(usuario!.intentos_fallidos ?? 0) + 1;
      const bloquear = intentos >= MAX_INTENTOS_FALLIDOS;

      if (bloquear) {
        await this.usuarioRepo.update(usuario!.id_usuario, {
          intentos_fallidos: 0,
          bloqueado_hasta: new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000).toISOString(),
        });
      } else {
        await this.usuarioRepo.update(usuario!.id_usuario, { intentos_fallidos: intentos });
      }

      await this.auditoria.registrar({
        evento: bloquear ? 'CUENTA_BLOQUEADA_INTENTOS' : 'LOGIN_FALLIDO',
        recurso: `usuarios/${usuario!.id_usuario}`,
        resultado: 'DENEGADO',
        id_usuario: usuario!.id_usuario,
        rol: usuario!.tipo_usuario,
        detalle: { motivo: 'contrasenia_incorrecta', intentos },
      });
      throw new UnauthorizedException(MENSAJE_LOGIN);
    }

    // Credenciales correctas, pero la identidad está desactivada (Parte 1-d).
    // Se comprueba DESPUÉS de la contraseña para no revelar a un tercero el estado.
    if (usuario!.estado !== 'ACTIVA') {
      await this.auditoria.registrar({
        // Intentar usar la cuenta de emergencia mientras está en reposo es una alerta
        evento: usuario!.es_emergencia
          ? 'EMERGENCIA_INTENTO_EN_REPOSO'
          : 'LOGIN_RECHAZADO_IDENTIDAD_INACTIVA',
        recurso: `usuarios/${usuario!.id_usuario}`,
        resultado: 'DENEGADO',
        id_usuario: usuario!.id_usuario,
        rol: usuario!.tipo_usuario,
        detalle: { estado: usuario!.estado },
      });
      throw new ForbiddenException('Tu cuenta no está activa. Contacta al administrador.');
    }

    // Cuenta de emergencia activa: su ventana puede haber vencido; si no, queda el rastro de su uso
    if (usuario!.es_emergencia) {
      if (emergenciaVencida(usuario!)) {
        await expirarEmergencia(this.usuarioRepo, this.auditoria, usuario!.id_usuario);
        throw new ForbiddenException('La ventana de la cuenta de emergencia terminó. Solicita una nueva activación.');
      }
      this.logger.warn(`CUENTA DE EMERGENCIA en uso: usuario ${usuario!.id_usuario}`);
      await this.auditoria.registrar({
        evento: 'EMERGENCIA_LOGIN',
        recurso: `usuarios/${usuario!.id_usuario}`,
        id_usuario: usuario!.id_usuario,
        rol: usuario!.tipo_usuario,
        detalle: { motivo_activacion: usuario!.motivo_estado, sesion_minutos: MINUTOS_SESION_EMERGENCIA },
      });
    }

    // Login correcto: limpiar contadores y, si el hash se creó con menos rondas
    // que las actuales (p. ej. cost 10), se vuelve a guardar con cost 12.
    const cambios: Partial<Usuario> = {};
    if (Number(usuario!.intentos_fallidos ?? 0) > 0 || usuario!.bloqueado_hasta) {
      cambios.intentos_fallidos = 0;
      cambios.bloqueado_hasta = null;
    }
    try {
      if (bcrypt.getRounds(usuario!.contrasenia) < BCRYPT_ROUNDS) {
        cambios.contrasenia = await bcrypt.hash(contrasenia, BCRYPT_ROUNDS);
      }
    } catch {
      /* hash con formato inesperado: se deja como está */
    }
    if (Object.keys(cambios).length > 0) {
      await this.usuarioRepo.update(usuario!.id_usuario, cambios);
    }

    await this.auditoria.registrar({
      evento: 'LOGIN_OK',
      recurso: `usuarios/${usuario!.id_usuario}`,
      id_usuario: usuario!.id_usuario,
      rol: usuario!.tipo_usuario,
    });

    const payload = {
      id_usuario: usuario!.id_usuario,
      tipo_usuario: usuario!.tipo_usuario,
      correo: usuario!.correo,
      tv: Number(usuario!.token_version ?? 0), // versión para poder revocar sesiones
    };

    // Las sesiones de la cuenta de emergencia duran poco
    const esEmergencia = !!usuario!.es_emergencia;
    return {
      mensaje: 'Inicio de sesión correcto',
      accessToken: this.jwtService.sign(
        payload,
        esEmergencia ? { expiresIn: `${MINUTOS_SESION_EMERGENCIA}m` } : undefined,
      ),
      expiraEnMs: (esEmergencia ? MINUTOS_SESION_EMERGENCIA : 8 * 60) * 60 * 1000,
      usuario: {
        id_usuario: usuario!.id_usuario,
        nombres: usuario!.nombres,
        ap_pat: usuario!.ap_pat,
        tipo_usuario: usuario!.tipo_usuario,
      },
    };
  }

  /**
   * Parte 2-d: cerrar sesión de verdad. No basta con borrar la cookie: se sube
   * token_version, así que el token (aunque alguien lo hubiera copiado) deja de valer.
   * Efecto: se cierran las sesiones de esa cuenta en todos los dispositivos.
   */
  async cerrarSesion(token?: string) {
    if (!token) return;
    try {
      const p = await this.jwtService.verifyAsync<{ id_usuario: string; tipo_usuario?: string; tv?: number }>(
        token,
        { algorithms: ['HS256'] },
      );
      const res = await this.usuarioRepo
        .createQueryBuilder()
        .update(Usuario)
        .set({ token_version: () => 'token_version + 1' })
        .where('id_usuario = :id AND token_version = :tv', { id: p.id_usuario, tv: Number(p.tv ?? 0) })
        .execute();
      if (res.affected) {
        await this.auditoria.registrar({
          evento: 'LOGOUT',
          recurso: `usuarios/${p.id_usuario}`,
          id_usuario: p.id_usuario,
          rol: p.tipo_usuario ?? null,
        });
      }
    } catch {
      /* token inválido o vencido: solo se borra la cookie */
    }
  }

  // ---------- Recuperación de contraseña ----------

  async perfil(idUsuario: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: idUsuario },
      select: { id_usuario: true, nombres: true, ap_pat: true, tipo_usuario: true },
    });
    if (!usuario) throw new UnauthorizedException('Sesión inválida.');
    return usuario;
  }

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

    // El correo se envía SIN esperar y los fallos solo se registran: así ni el tiempo
    // de respuesta ni un error 500 delatan que el correo tiene cuenta (Parte 2-f).
    void this.enviarCorreoRecuperacion(correo, token, usuario.id_usuario);

    return respuestaGenerica;
  }

  private async enviarCorreoRecuperacion(correo: string, token: string, idUsuario: string) {
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
    } catch (error) {
      this.logger.error('Error enviando correo de recuperación', error as Error);
      await this.usuarioRepo
        .update(idUsuario, { reset_token: null, reset_token_expira: null })
        .catch(() => undefined);
    }
  }

  async restablecerContrasenia(token: string, nuevaContrasenia: string) {
    // Evita que findOne({ reset_token: undefined }) devuelva un usuario cualquiera
    if (!token) {
      throw new BadRequestException('El token de recuperación es obligatorio.');
    }

    if (!cumplePolitica(nuevaContrasenia)) {
      throw new BadRequestException(MENSAJE_POLITICA);
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

    const contraseniaHasheada = await bcrypt.hash(nuevaContrasenia, BCRYPT_ROUNDS);

    await this.usuarioRepo.update(usuario.id_usuario, {
      contrasenia: contraseniaHasheada,
      reset_token: null,
      reset_token_expira: null,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      // Cambiar la clave cierra las sesiones abiertas con la anterior
      token_version: () => 'token_version + 1',
    } as any);

    await this.auditoria.registrar({
      evento: 'CONTRASENIA_RESTABLECIDA',
      recurso: `usuarios/${usuario.id_usuario}`,
      id_usuario: usuario.id_usuario,
      rol: usuario.tipo_usuario,
    });

    return { mensaje: 'Tu contraseña ha sido actualizada con éxito.' };
  }
}
