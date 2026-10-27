import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { UpdateEmpleadoDto } from './dto/empleado.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UsuarioActual, exigirPropioORoles } from '../common/acceso';

// No hay POST ni DELETE: un empleado se crea y se elimina junto con su rol
// (POST /veterinarios, /estilistas, /recepcionistas y sus DELETE).
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly servicio: EmpleadosService) {}

  // Incluye salarios: solo administradores
  @Roles('ADMIN')
  @Get()
  listar() {
    return this.servicio.listarConUsuarios();
  }


  // Cada empleado puede ver sus propios datos laborales
  @Roles('ADMIN', 'VETERINARIO', 'ESTILISTA', 'RECEPCIONISTA')
  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() user: JwtPayload,
  ) {
    exigirPropioORoles(user, id, ['ADMIN']);
    return this.servicio.obtener(String(id));
  }

  // Cambiar salario u horario: solo administradores
  @Roles('ADMIN')
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoDto,
  ) {
    return this.servicio.actualizar(String(id), dto);
  }
}
