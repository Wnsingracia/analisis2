import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/clientes.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { DispositivosModule } from 'src/dispositivos/dispositivos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente]), UsuariosModule, DispositivosModule],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
