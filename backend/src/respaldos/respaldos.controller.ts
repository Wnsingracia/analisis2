import { Controller, Post, UseGuards } from '@nestjs/common';

import { RespaldosService } from './respaldos.service';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Requiere2FA } from '../guards/requiere2fa.decorator';

@Controller('respaldos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Requiere2FA()
export class RespaldosController {
  constructor(private readonly respaldosService: RespaldosService) {}

  @Post('generar')
  async generarRespaldo() {
    return this.respaldosService.generarRespaldo();
  }

  @Post('generar-drive')
  async generarRespaldoDrive() {
    return this.respaldosService.generarRespaldoDrive();
  }
}
