import { Module } from '@nestjs/common';

import { RespaldosService } from './respaldos.service';
import { RespaldosController } from './respaldos.controller';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [AuditoriaModule],
  controllers: [RespaldosController],
  providers: [RespaldosService, JwtAuthGuard],
  exports: [RespaldosService],
})
export class RespaldosModule {}
