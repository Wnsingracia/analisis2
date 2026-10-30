import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ClientesModule } from '../clientes/clientes.module';
import { TurnstileService } from './turnstile.service';


// JwtModule ya es global (AppModule): aquí no se vuelve a registrar
@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), ClientesModule],
  controllers: [AuthController],
  providers: [AuthService,TurnstileService],
  exports: [AuthService],
})
export class AuthModule {}
