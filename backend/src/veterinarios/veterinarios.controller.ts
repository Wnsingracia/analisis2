import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { VeterinariosService } from './veterinarios.service';
import { CreateVeterinarioDto, UpdateVeterinarioDto } from './dto/veterinarios.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Requiere2FA } from '../guards/requiere2fa.decorator';
import { UsuarioActual, exigirPropioORoles } from '../common/acceso';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('veterinarios')
export class VeterinariosController {
  constructor(private readonly servicio: VeterinariosService) {}

  @Roles('ADMIN', 'RECEPCIONISTA')
  @Get()
  listar() {
    return this.servicio.listar();
  }

  // Admin y recepcionista ven a cualquiera; veterinario solo su propio registro
  @Roles('ADMIN', 'RECEPCIONISTA', 'VETERINARIO')
  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    exigirPropioORoles(user, id, ['ADMIN', 'RECEPCIONISTA']);
    return this.servicio.obtener(String(id));
  }

  // Mascotas que atendió este veterinario
  @Roles('ADMIN', 'RECEPCIONISTA', 'VETERINARIO')
  @Get(':id/pacientes')
  pacientes(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    exigirPropioORoles(user, id, ['ADMIN', 'RECEPCIONISTA']);
    return this.servicio.pacientes(String(id));
  }

  // Contratar personal: solo administradores
  @Roles('ADMIN')
  @Post()
  crear(@Body() dto: CreateVeterinarioDto) {
    return this.servicio.crear(dto);
  }

  @Roles('ADMIN')
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVeterinarioDto,
  ) {
    return this.servicio.actualizar(String(id), dto);
  }

  @Roles('ADMIN')
  @Requiere2FA()
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(String(id));
  }
}
