import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaInterceptor } from './auditoria.interceptor';
import { AuditoriaExceptionFilter } from './auditoria.filter';

// Global: cualquier módulo puede inyectar AuditoriaService sin importarlo
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Auditoria])],
  controllers: [AuditoriaController],
  providers: [
    AuditoriaService,
    // Se aplican a TODA la aplicación, no solo a este módulo
    { provide: APP_INTERCEPTOR, useClass: AuditoriaInterceptor },
    { provide: APP_FILTER, useClass: AuditoriaExceptionFilter },
  ],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
