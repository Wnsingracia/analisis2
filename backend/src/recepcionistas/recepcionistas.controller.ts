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
import { RecepcionistasService } from './recepcionistas.service';
import { CreateRecepcionistaDto, UpdateRecepcionistaDto } from './dto/recepcionistas.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Requiere2FA } from '../guards/requiere2fa.decorator';
import { UsuarioActual, exigirPropioORoles } from '../common/acceso';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recepcionistas')
export class RecepcionistasController {
  constructor(private readonly servicio: RecepcionistasService) {}

  @Roles('ADMIN', 'RECEPCIONISTA')
  @Get()
  listar() {
    return this.servicio.listar();
  }

  // Admin y recepcionista ven a cualquiera; recepcionista solo su propio registro
  @Roles('ADMIN', 'RECEPCIONISTA')
  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    exigirPropioORoles(user, id, ['ADMIN', 'RECEPCIONISTA']);
    return this.servicio.obtener(String(id));
  }

  // Contratar personal: solo administradores
  @Roles('ADMIN')
  @Post()
  crear(@Body() dto: CreateRecepcionistaDto) {
    return this.servicio.crear(dto);
  }

  @Roles('ADMIN')
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecepcionistaDto,
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
