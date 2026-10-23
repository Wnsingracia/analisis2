import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RecuperarDto, RestablecerDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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