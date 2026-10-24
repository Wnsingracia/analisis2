import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstilistasController } from './estilistas.controller';
import { EstilistasService } from './estilistas.service';
import { Estilista } from './entities/estilistas.entity';
import { EmpleadosModule } from '../empleados/empleados.module';

@Module({
  imports: [TypeOrmModule.forFeature([Estilista]), EmpleadosModule],
  controllers: [EstilistasController],
  providers: [EstilistasService],
})
export class EstilistasModule {}
