import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TratamientosController } from './tratamientos.controller';
import { TratamientosService } from './tratamientos.service';
import { Tratamiento } from './entities/tratamientos.entity';
import { ConsultasModule } from '../consultas/consultas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tratamiento]), ConsultasModule],
  controllers: [TratamientosController],
  providers: [TratamientosService],
})
export class TratamientosModule {}
