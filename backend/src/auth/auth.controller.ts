import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ClientesService } from '../clientes/clientes.service';
import { CreateClienteDto } from '../clientes/dto/clientes.dto';
import { CodigoDto, LoginDto, RecuperarDto, RestablecerDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { UsuarioActual } from '../common/acceso';
import { LimiteIntentos, LimiteIntentosGuard } from '../common/limite-intentos';
import { TotpService } from '../segundo-factor/totp.service';

const COOKIE = 'vetcare_token';

// Mismo texto si el correo era nuevo o ya existía (Parte 2-f: no revelar si hay cuenta)
const MENSAJE_REGISTRO =
  'Solicitud de registro procesada. Si el correo no tenía cuenta, ya se creó: inicia sesión. ' +
  'Si ya estaba registrado, usa "¿Olvidaste tu contraseña?" para recuperar el acceso.';

// El guard solo actúa en las rutas marcadas con @LimiteIntentos(...)
@UseGuards(LimiteIntentosGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientesService: ClientesService,
    private readonly totpService: TotpService,
  ) {}

  @Post('login')
  @LimiteIntentos(10, 15) // máx. 10 intentos por IP cada 15 min (se suma al bloqueo por cuenta)
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, usuario, mensaje, expiraEnMs } = await this.authService.login(dto);

    res.cookie(COOKIE, accessToken, {
      httpOnly: true,                                 // JavaScript no puede leerla
      secure: process.env.NODE_ENV === 'production',  // solo por HTTPS en producción
      sameSite: 'strict',                             // frena CSRF
      maxAge: expiraEnMs,                             // igual que la expiración del JWT (8 h; 30 min en emergencia)
      path: '/',
    });

    return { mensaje, usuario }; // el token ya no viaja en el cuerpo
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Revoca el token en el servidor (no solo borra la cookie)
    await this.authService.cerrarSesion((req as any).cookies?.[COOKIE]);
    res.clearCookie(COOKIE, { path: '/' });
    return { mensaje: 'Sesión cerrada.' };
  }

  // El frontend lo llama al cargar la página para saber quién está logueado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@UsuarioActual() user: JwtPayload) {
    return this.authService.perfil(String(user.id_usuario));
  }

  // Registro público: siempre crea un CLIENTE (CreateClienteDto no acepta tipo_usuario).
  // Responde igual si el correo ya existía, para no permitir enumerar cuentas.
  @Post('registro')
  @LimiteIntentos(10, 60)
  @HttpCode(200)
  async registro(@Body() dto: CreateClienteDto) {
    try {
      await this.clientesService.crear(dto);
    } catch (error) {
      if (!(error instanceof ConflictException)) throw error;
    }
    return { mensaje: MENSAJE_REGISTRO };
  }

  @Post('recuperar')
  @LimiteIntentos(5, 15)
  @HttpCode(200)
  recuperar(@Body() dto: RecuperarDto) {
    return this.authService.solicitarRecuperacion(dto.correo);
  }

  @Post('restablecer')
  @LimiteIntentos(10, 15)
  @HttpCode(200)
  restablecer(@Body() dto: RestablecerDto) {
    return this.authService.restablecerContrasenia(
      dto.token,
      dto.nuevaContrasenia,
    );
  }

  // ---------- Segundo factor (TOTP) ----------

  @UseGuards(JwtAuthGuard)
  @Get('2fa')
  estado2fa(@UsuarioActual() user: JwtPayload) {
    return this.totpService.estado(String(user.id_usuario));
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/configurar')
  @HttpCode(200)
  configurar2fa(@UsuarioActual() user: JwtPayload) {
    return this.totpService.iniciarConfiguracion(String(user.id_usuario));
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/activar')
  @HttpCode(200)
  activar2fa(@UsuarioActual() user: JwtPayload, @Body() dto: CodigoDto) {
    return this.totpService.activar(String(user.id_usuario), dto.codigo);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/desactivar')
  @HttpCode(200)
  desactivar2fa(@UsuarioActual() user: JwtPayload, @Body() dto: CodigoDto) {
    return this.totpService.desactivar(String(user.id_usuario), dto.codigo);
  }
}
