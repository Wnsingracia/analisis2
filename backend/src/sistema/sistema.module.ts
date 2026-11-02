import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionSistema } from './entities/configuracion-sistema.entity';
import { ModoSistemaService } from './modo-sistema.service';
import { ModoSistemaGuard } from './modo-sistema.guard';
import { SistemaController } from './sistema.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracionSistema])],
  controllers: [SistemaController],
  providers: [
    ModoSistemaService,
    // Se aplica a TODA la aplicación, antes que los guards de cada controlador
    { provide: APP_GUARD, useClass: ModoSistemaGuard },
  ],
  exports: [ModoSistemaService],
})
export class SistemaModule {}
