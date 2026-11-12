import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadosController } from './empleados.controller';
import { EmpleadosService } from './empleados.service';
import { Empleado } from './entities/empleados.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { DispositivosModule } from 'src/dispositivos/dispositivos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado]), UsuariosModule, DispositivosModule],
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
  exports: [EmpleadosService],
})
export class EmpleadosModule {}
