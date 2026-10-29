import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { ClientesService } from '../clientes/clientes.service';
import { CreateClienteDto } from '../clientes/dto/clientes.dto';
import { LoginDto, RecuperarDto, RestablecerDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { UsuarioActual } from '../common/acceso';

const COOKIE = 'vetcare_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientesService: ClientesService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, usuario, mensaje } = await this.authService.login(dto);

    res.cookie(COOKIE, accessToken, {
      httpOnly: true,                                 // JavaScript no puede leerla
      secure: process.env.NODE_ENV === 'production',  // solo por HTTPS en producción
      sameSite: 'strict',                             // frena CSRF
      maxAge: 8 * 60 * 60 * 1000,                     // igual que la expiración del JWT
      path: '/',
    });

    return { mensaje, usuario }; // el token ya no viaja en el cuerpo
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE, { path: '/' });
    return { mensaje: 'Sesión cerrada.' };
  }

  // El frontend lo llama al cargar la página para saber quién está logueado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@UsuarioActual() user: JwtPayload) {
    return this.authService.perfil(String(user.id_usuario));
  }

  // Registro público: siempre crea un CLIENTE (CreateClienteDto no acepta tipo_usuario)
  @Post('registro')
  registro(@Body() dto: CreateClienteDto) {
    return this.clientesService.crear(dto);
  }

  @Post('recuperar')
  @HttpCode(200)
  recuperar(@Body() dto: RecuperarDto) {
    return this.authService.solicitarRecuperacion(dto.correo);
  }

  @Post('restablecer')
  @HttpCode(200)
  restablecer(@Body() dto: RestablecerDto) {
    return this.authService.restablecerContrasenia(
      dto.token,
      dto.nuevaContrasenia,
    );
  }
}