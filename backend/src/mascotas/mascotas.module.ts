import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MascotasController } from './mascotas.controller';
import { MascotasService } from './mascotas.service';
import { Mascota } from './entities/mascotas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mascota])],
  controllers: [MascotasController],
  providers: [MascotasService],
})
export class MascotasModule {}
