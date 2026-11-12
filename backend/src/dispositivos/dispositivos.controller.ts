
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';

import { DispositivosService } from './dispositivos.service';
import { CrearDesafioDto } from './dto/crear-desafio.dto';
import { VerificarDispositivoDto } from './dto/verificar-dispositivo.dto';

import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

interface RequestDispositivo {
  user?: {
    id_usuario: string;
    tipo_usuario: string;
  };
  deviceSessionHash?: string;
}

@Controller('dispositivos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DispositivosController {
  constructor(
    private readonly dispositivosService: DispositivosService,
  ) {}

  // ADMIN: consultar los dispositivos registrados.
  @Get()
  @Roles('ADMIN')
  listar() {
    return this.dispositivosService.listar();
  }

  // ADMIN: revocar un dispositivo.
  @Patch(':id/revocar')
  @Roles('ADMIN')
  revocar(@Param('id') id: string) {
    return this.dispositivosService.revocar(id);
  }

  // RECEPCIONISTA: solicitar un desafío para una PC concreta.
  @Post('desafio')
  @Roles('RECEPCIONISTA')
  crearDesafio(
    @Req() request: RequestDispositivo,
    @Body() dto: CrearDesafioDto,
  ) {
    const idUsuario = request.user?.id_usuario;
    const hashSesion = request.deviceSessionHash;

    if (!idUsuario || !hashSesion) {
      throw new UnauthorizedException(
        'No se pudo identificar la sesión actual.',
      );
    }

    return this.dispositivosService.crearDesafio(
      idUsuario,
      hashSesion,
      dto.idDispositivo,
    );
  }

  // RECEPCIONISTA: verificar la firma devuelta por el agente Python.
  @Post('verificar')
  @Roles('RECEPCIONISTA')
  verificarDispositivo(
    @Req() request: RequestDispositivo,
    @Body() dto: VerificarDispositivoDto,
  ) {
    const idUsuario = request.user?.id_usuario;
    const hashSesion = request.deviceSessionHash;

    if (!idUsuario || !hashSesion) {
      throw new UnauthorizedException(
        'No se pudo identificar la sesión actual.',
      );
    }

    return this.dispositivosService.verificarDispositivo(
      idUsuario,
      hashSesion,
      dto.challengeToken,
      dto.firma,
    );
  }
}
