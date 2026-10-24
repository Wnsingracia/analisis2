import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultasController } from './consultas.controller';
import { ConsultasService } from './consultas.service';
import { Consulta } from './entities/consultas.entity';
import { Mascota } from '../mascotas/entities/mascotas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consulta, Mascota])],
  controllers: [ConsultasController],
  providers: [ConsultasService],
  exports: [ConsultasService],
})
export class ConsultasModule {}
