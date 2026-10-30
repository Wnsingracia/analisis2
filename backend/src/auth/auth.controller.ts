
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import type { Response } from 'express';

import { AuthService } from './auth.service';
import { ClientesService } from '../clientes/clientes.service';
import { CreateClienteDto } from '../clientes/dto/clientes.dto';
import {
  LoginDto,
  RecuperarDto,
  RestablecerDto
} from './dto/auth.dto';

import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { UsuarioActual } from '../common/acceso';
import { TurnstileService } from './turnstile.service';

const COOKIE = 'vetcare_token';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly clientesService: ClientesService,
    private readonly turnstileService: TurnstileService,
  ) {}

  // LOGIN
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {

    const {
      accessToken,
      usuario,
      mensaje
    } = await this.authService.login(dto);

    res.cookie(COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    });

    return { mensaje, usuario };
  }

  // LOGOUT
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE, { path: '/' });

    return { mensaje: 'Sesión cerrada.' };
  }

  // PERFIL
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@UsuarioActual() user: JwtPayload) {
    return this.authService.perfil(String(user.id_usuario));
  }

  // REGISTRO
  @Post('registro')
  @HttpCode(201)
  async registro(
    @Body() dto: CreateClienteDto & { captchaToken: string }
  ) {

    // Verificar CAPTCHA antes de crear el cliente
    await this.turnstileService.verificarCaptcha(
      dto.captchaToken
    );

    // Eliminar captchaToken para no enviarlo al servicio de clientes
    const { captchaToken, ...datosCliente } = dto;

    return this.clientesService.crear(datosCliente);
  }

  // RECUPERACIÓN
  @Post('recuperar')
  @HttpCode(200)
  recuperar(@Body() dto: RecuperarDto) {
    return this.authService.solicitarRecuperacion(dto.correo);
  }

  // RESTABLECER
  @Post('restablecer')
  @HttpCode(200)
  restablecer(@Body() dto: RestablecerDto) {
    return this.authService.restablecerContrasenia(
      dto.token,
      dto.nuevaContrasenia,
    );
  }
}
