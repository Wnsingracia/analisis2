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
import { ClientesService } from './clientes.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/clientes.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UsuarioActual, exigirPropioORoles } from '../common/acceso';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly servicio: ClientesService) {}

  @Roles('ADMIN', 'RECEPCIONISTA', 'VETERINARIO')
  @Get()
  listar() {
    return this.servicio.listar();
  }

  // El personal ve a cualquier cliente; un cliente, solo su propio registro
  @Roles('ADMIN', 'RECEPCIONISTA', 'VETERINARIO', 'CLIENTE')
  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    exigirPropioORoles(user, id, ['ADMIN', 'RECEPCIONISTA', 'VETERINARIO']);
    return this.servicio.obtener(String(id));
  }

  // Alta de cliente en mostrador. El registro público es POST /auth/registro
  @Roles('ADMIN', 'RECEPCIONISTA')
  @Post()
  crear(@Body() dto: CreateClienteDto) {
    return this.servicio.crear(dto);
  }

  @Roles('ADMIN', 'RECEPCIONISTA', 'CLIENTE')
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteDto,
    @UsuarioActual() user: JwtPayload,
  ) {
    exigirPropioORoles(user, id, ['ADMIN', 'RECEPCIONISTA']);
    return this.servicio.actualizar(String(id), dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(String(id));
  }
}
