import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { DispositivosModule } from 'src/dispositivos/dispositivos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), DispositivosModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}