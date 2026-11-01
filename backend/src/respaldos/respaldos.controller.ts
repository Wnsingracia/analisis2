
import {
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { RespaldosService } from './respaldos.service';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import { AdminGuard } from '../guards/AdminGuard';

@Controller('respaldos')
@UseGuards(JwtAuthGuard, AdminGuard)
export class RespaldosController {
  constructor(
    private readonly respaldosService: RespaldosService,
  ) {}

  /**
   * POST /respaldos/generar
   * Solamente administradores autenticados.
   */
  @Post('generar')
  async generarRespaldo() {
    return this.respaldosService.generarRespaldo();
  }

  @Post('generar-drive')
  async generarRespaldoDrive(){
    return await this.respaldosService.generarRespaldoDrive();
  }
}
