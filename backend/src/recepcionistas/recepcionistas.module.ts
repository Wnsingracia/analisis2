import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecepcionistasController } from './recepcionistas.controller';
import { RecepcionistasService } from './recepcionistas.service';
import { Recepcionista } from './entities/recepcionistas.entity';
import { EmpleadosModule } from '../empleados/empleados.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recepcionista]), EmpleadosModule],
  controllers: [RecepcionistasController],
  providers: [RecepcionistasService],
})
export class RecepcionistasModule {}
