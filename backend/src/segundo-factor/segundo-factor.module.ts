import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { TotpService } from './totp.service';

// Global: RolesGuard (usado en todos los módulos) necesita TotpService
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [TotpService],
  exports: [TotpService],
})
export class SegundoFactorModule {}
