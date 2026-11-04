
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Dispositivo } from './entities/dispositivos.entity';
import { DispositivosService } from './dispositivos.service';
import { DispositivosController } from './dispositivos.controller';
import { DispositivoGuard } from './dispositivo.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispositivo]),
  ],
  controllers: [
    DispositivosController,
  ],
  providers: [
    DispositivosService,
    DispositivoGuard,
  ],
  exports: [
    DispositivosService,
    DispositivoGuard,
  ],
})
export class DispositivosModule {}
