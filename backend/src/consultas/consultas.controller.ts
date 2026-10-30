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
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto, UpdateConsultaDto } from './dto/consultas.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Requiere2FA } from '../guards/requiere2fa.decorator';
import { UsuarioActual } from '../common/acceso';

// Historial médico: el recepcionista y el estilista no tienen acceso
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('consultas')
export class ConsultasController {
  constructor(private readonly servicio: ConsultasService) {}

  // ADMIN: todas. VETERINARIO: las suyas. CLIENTE: las de sus mascotas.
  @Roles('ADMIN', 'VETERINARIO', 'CLIENTE')
  @Get()
  listar(@UsuarioActual() user: JwtPayload) {
    return this.servicio.listar(user);
  }

  @Roles('ADMIN', 'VETERINARIO', 'CLIENTE')
  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    return this.servicio.obtener(String(id), user);
  }

  // Separación de funciones: el contenido clínico lo redacta solo el veterinario
  @Roles('VETERINARIO')
  @Post()
  crear(@Body() dto: CreateConsultaDto, @UsuarioActual() user: JwtPayload) {
    return this.servicio.crear(dto, user);
  }

  @Roles('VETERINARIO')
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConsultaDto,
    @UsuarioActual() user: JwtPayload,
  ) {
    return this.servicio.actualizar(String(id), dto, user);
  }

  @Roles('ADMIN')
  @Requiere2FA()
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(String(id));
  }
}
