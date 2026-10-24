import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { Cita } from './entities/citas.entity';
import { Mascota } from '../mascotas/entities/mascotas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cita, Mascota])],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}
