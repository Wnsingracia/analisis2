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
import { TratamientosService } from './tratamientos.service';
import {
  CreateTratamientoDto,
  UpdateTratamientoDto,
} from './dto/tratamientos.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UsuarioActual } from '../common/acceso';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tratamientos')
export class TratamientosController {
  constructor(private readonly servicio: TratamientosService) {}

  // ADMIN: todos. VETERINARIO: los de sus consultas. CLIENTE: los de sus mascotas.
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

  @Roles('ADMIN', 'VETERINARIO')
  @Post()
  crear(@Body() dto: CreateTratamientoDto, @UsuarioActual() user: JwtPayload) {
    return this.servicio.crear(dto, user);
  }

  @Roles('ADMIN', 'VETERINARIO')
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTratamientoDto,
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
