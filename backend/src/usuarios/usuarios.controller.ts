import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
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
import { Requiere2FA } from '../guards/requiere2fa.decorator';

type RequestConUsuario = Request & { user: JwtPayload };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarioServicio: UsuariosService) {}

  // ADMIN ve a todos. La recepción solo ve a los clientes (no a administradores ni personal)
  @Roles('ADMIN', 'RECEPCIONISTA')
  @Get()
  obtTodo(@Req() req: RequestConUsuario) {
    const soloClientes = String(req.user.tipo_usuario).toUpperCase() === 'RECEPCIONISTA';
    return this.usuarioServicio.obtTodo(soloClientes ? 'CLIENTE' : undefined);
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

    // La recepción solo puede consultar clientes (o su propio registro). Se responde 404
    // y no 403 para no revelar que existe una cuenta de administrador o de personal.
    const esRecepcion = String(req.user.tipo_usuario).toUpperCase() === 'RECEPCIONISTA';
    const esPropio = String(req.user.id_usuario) === String(id);
    if (esRecepcion && !esPropio && String(usuario.tipo_usuario).toUpperCase() !== 'CLIENTE') {
      throw new NotFoundException('Usuario no encontrado.');
    }
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
  @Requiere2FA()
  @Patch(':id/estado')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoDto) {
    return this.usuarioServicio.cambiarEstado(id, dto.estado, dto.motivo);
  }

  // Cambio de función del personal, con motivo y auditoría (solo ADMIN)
  @Roles('ADMIN')
  @Requiere2FA()
  @Patch(':id/rol')
  cambiarRol(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarRolDto) {
    return this.usuarioServicio.cambiarRol(id, dto);
  }

  // Cierra todas las sesiones abiertas de una cuenta (solo ADMIN, con 2.º factor)
  @Roles('ADMIN')
  @Requiere2FA()
  @Post(':id/revocar-sesiones')
  revocarSesiones(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioServicio.revocarSesiones(id);
  }

  // Baja lógica: la identidad queda REVOCADA, no se borra
  @Roles('ADMIN')
  @Requiere2FA()
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