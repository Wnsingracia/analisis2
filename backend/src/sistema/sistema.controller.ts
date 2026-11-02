import {
  Body,
  Controller,
  Get,
  Put,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ModoSistemaService } from './modo-sistema.service';
import { CambiarModoDto } from './dto/modo.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Requiere2FA } from '../guards/requiere2fa.decorator';
import { UsuarioActual } from '../common/acceso';

@Controller()
export class SistemaController {
  constructor(
    private readonly modos: ModoSistemaService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Punto de salud (Parte 5-b). Público y mínimo: no revela datos internos.
   * Responde 503 si la base de datos —de la que depende la identidad— no contesta.
   */
  @Get('health')
  async health() {
    try {
      await this.dataSource.query('SELECT 1');
      return { estado: 'ok', base_de_datos: 'ok' };
    } catch {
      throw new ServiceUnavailableException({
        statusCode: 503,
        estado: 'degradado',
        base_de_datos: 'no disponible',
        message: 'Servicio de identidad no disponible.',
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('sistema/modo')
  obtenerModo() {
    return this.modos.obtener();
  }

  // Cambiar el modo de operación es una decisión de contención: solo ADMIN, con 2.º factor y motivo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Requiere2FA()
  @Put('sistema/modo')
  cambiarModo(@Body() dto: CambiarModoDto, @UsuarioActual() user: JwtPayload) {
    return this.modos.cambiar(dto.modo, dto.motivo, String(user.id_usuario));
  }
}
