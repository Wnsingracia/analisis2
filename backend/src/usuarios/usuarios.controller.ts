import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUserDto, UpdateUserDto } from './dto/usuarios.dto';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard'; //[cite: 18]

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarioServicio: UsuariosService) {}

  // =========================================================================
  // 1. RUTAS DE LECTURA (GET)
  // =========================================================================

  @Get()
  async obtTodo() {
    return this.usuarioServicio.obtTodo();
  }

  @Get(':id')
  async obtUsuario(@Param('id') id: string) {
    return this.usuarioServicio.obtUsuario(id);
  }

  // =========================================================================
  // 2. CREACIÓN (POST)
  // =========================================================================

  @Post()
  async inserta(@Body() createUserDto: CreateUserDto) {
    return this.usuarioServicio.inserta(createUserDto);
  }

  // =========================================================================
  // 3. ACTUALIZACIÓN (PUT)
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usuarioServicio.actualizar(id, updateUserDto);
  }

  // =========================================================================
  // 4. ELIMINACIÓN (DELETE)
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return this.usuarioServicio.eliminar(id);
  }
}