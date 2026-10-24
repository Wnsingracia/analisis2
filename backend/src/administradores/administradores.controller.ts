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
import { AdministradoresService } from './administradores.service';
import {
  CreateAdministradorDto,
  UpdateAdministradorDto,
} from './dto/administradores.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UsuarioActual, idDe } from '../common/acceso';

// Todo este controller es exclusivo de administradores
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('administradores')
export class AdministradoresController {
  constructor(private readonly servicio: AdministradoresService) {}

  @Get()
  listar() {
    return this.servicio.listar();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtener(String(id));
  }

  @Post()
  crear(@Body() dto: CreateAdministradorDto) {
    return this.servicio.crear(dto);
  }

  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdministradorDto,
  ) {
    return this.servicio.actualizar(String(id), dto);
  }

  @Delete(':id')
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    return this.servicio.eliminar(String(id), idDe(user));
  }
}
