import {
  Controller,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsuariosService } from './usuarios.service';
import {
  UpdateUserDto,
  TIPOS_USUARIO,
  CambiarEstadoDto,
  CambiarRolDto,
} from './dto/usuarios.dto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import type { JwtPayload } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

type RequestConUsuario = Request & { user: JwtPayload };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarioServicio: UsuariosService) {}

  // Solo el personal de gestión puede ver el listado completo
  @Roles('ADMIN', 'RECEPCIONISTA')
  @Get()
  obtTodo() {
    return this.usuarioServicio.obtTodo();
  }

  // Admin y recepcionista ven a cualquiera; el resto, solo su propio registro
  @Roles(...TIPOS_USUARIO)
  @Get(':id')
  async obtUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestConUsuario,
  ) {
    this.verificarAcceso(id, req.user, ['ADMIN', 'RECEPCIONISTA']);

    const usuario = await this.usuarioServicio.obtUsuario(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');
    return usuario;
  }

  // Admin edita a cualquiera; los demás, solo su propio usuario
  @Roles(...TIPOS_USUARIO)
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: RequestConUsuario,
  ) {
    this.verificarAcceso(id, req.user, ['ADMIN']);
    return this.usuarioServicio.actualizar(id, dto);
  }

  // Suspender, reactivar o revocar una identidad (solo ADMIN)
  @Roles('ADMIN')
  @Patch(':id/estado')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoDto) {
    return this.usuarioServicio.cambiarEstado(id, dto.estado, dto.motivo);
  }

  // Cambio de función del personal, con motivo y auditoría (solo ADMIN)
  @Roles('ADMIN')
  @Patch(':id/rol')
  cambiarRol(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarRolDto) {
    return this.usuarioServicio.cambiarRol(id, dto);
  }

  // Baja lógica: la identidad queda REVOCADA, no se borra
  @Roles('ADMIN')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioServicio.eliminar(id);
  }

  // Deja pasar si el rol está en la lista o si el usuario accede a su propio id
  private verificarAcceso(
    idSolicitado: number,
    user: JwtPayload,
    rolesConAccesoTotal: string[],
  ) {
    const rol = String(user.tipo_usuario ?? '').toUpperCase();
    const esPropio = String(user.id_usuario) === String(idSolicitado);

    if (!esPropio && !rolesConAccesoTotal.includes(rol)) {
      throw new ForbiddenException('No tienes permisos para este recurso.');
    }
  }
}