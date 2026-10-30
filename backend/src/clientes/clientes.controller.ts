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
import { Requiere2FA } from '../guards/requiere2fa.decorator';
import { UsuarioActual, exigirPropioORoles, rolDe, idDe } from '../common/acceso';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly servicio: ClientesService) {}

  // El listado completo es solo de gestión: el veterinario ya no lo ve
  @Roles('ADMIN', 'RECEPCIONISTA')
  @Get()
  listar() {
    return this.servicio.listar();
  }

  // Gestión ve a cualquier cliente; un cliente, solo su registro; un veterinario, solo al
  // dueño de una mascota que ha atendido (relación persona/objeto)
  @Roles('ADMIN', 'RECEPCIONISTA', 'VETERINARIO', 'CLIENTE')
  @Get(':id')
  async obtener(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    if (rolDe(user) === 'VETERINARIO') {
      await this.servicio.exigirDuenoDePaciente(String(id), idDe(user));
    } else {
      exigirPropioORoles(user, id, ['ADMIN', 'RECEPCIONISTA']);
    }
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
  @Requiere2FA()
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(String(id));
  }
}
