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
import { CitasService } from './citas.service';
import { CreateCitaDto, UpdateCitaDto } from './dto/citas.dto';
import { TIPOS_USUARIO } from '../usuarios/dto/usuarios.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UsuarioActual } from '../common/acceso';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly servicio: CitasService) {}

  // Un cliente solo ve sus citas
  @Roles(...TIPOS_USUARIO)
  @Get()
  listar(@UsuarioActual() user: JwtPayload) {
    return this.servicio.listar(user);
  }

  // Citas con su consulta y tratamiento. Debe ir ANTES de ':id'
  @Roles('ADMIN', 'VETERINARIO', 'CLIENTE')
  @Get('agenda')
  agenda(@UsuarioActual() user: JwtPayload) {
    return this.servicio.agenda(user);
  }

  @Roles(...TIPOS_USUARIO)
  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    return this.servicio.obtener(String(id), user);
  }

  @Roles('ADMIN', 'RECEPCIONISTA')
  @Post()
  crear(@Body() dto: CreateCitaDto, @UsuarioActual() user: JwtPayload) {
    return this.servicio.crear(dto, user);
  }

  @Roles('ADMIN', 'RECEPCIONISTA')
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCitaDto,
  ) {
    return this.servicio.actualizar(String(id), dto);
  }

  @Roles('ADMIN', 'RECEPCIONISTA')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(String(id));
  }
}
