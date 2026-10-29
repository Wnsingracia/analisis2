import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto, UpdateMascotaDto } from './dto/mascotas.dto';
import { TIPOS_USUARIO } from '../usuarios/dto/usuarios.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UsuarioActual } from '../common/acceso';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mascotas')
export class MascotasController {
  constructor(private readonly servicio: MascotasService) {}

  // Un cliente solo recibe sus mascotas; el personal puede filtrar con ?id_cliente=
  @Roles(...TIPOS_USUARIO)
  @Get()
  listar(
    @UsuarioActual() user: JwtPayload,
    @Query('id_cliente') idCliente?: string,
  ) {
    return this.servicio.listar(user, idCliente);
  }
  

  @Roles(...TIPOS_USUARIO)
  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    return this.servicio.obtener(String(id), user);
  }

  @Roles('ADMIN', 'RECEPCIONISTA', 'CLIENTE')
  @Post()
  crear(@Body() dto: CreateMascotaDto, @UsuarioActual() user: JwtPayload) {
    return this.servicio.crear(dto, user);
  }

  @Roles('ADMIN', 'RECEPCIONISTA', 'VETERINARIO', 'CLIENTE')
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMascotaDto,
    @UsuarioActual() user: JwtPayload,
  ) {
    return this.servicio.actualizar(String(id), dto, user);
  }

  @Roles('ADMIN')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(String(id));
  }
}
