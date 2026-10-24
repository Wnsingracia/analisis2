import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientesService } from '../clientes/clientes.service';
import { CreateClienteDto } from '../clientes/dto/clientes.dto';
import { LoginDto, RecuperarDto, RestablecerDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientesService: ClientesService,
  ) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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
