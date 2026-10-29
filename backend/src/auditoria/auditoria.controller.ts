import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoria: AuditoriaService) {}

  // Solo lectura y solo para administradores. No existe PUT ni DELETE.
  @Roles('ADMIN')
  @Get()
  listar(@Query('limite', new DefaultValuePipe(100), ParseIntPipe) limite: number) {
    return this.auditoria.listar(limite);
  }
}
