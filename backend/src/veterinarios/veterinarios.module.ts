import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeterinariosController } from './veterinarios.controller';
import { VeterinariosService } from './veterinarios.service';
import { Veterinario } from './entities/veterinarios.entity';
import { EmpleadosModule } from '../empleados/empleados.module';

@Module({
  imports: [TypeOrmModule.forFeature([Veterinario]), EmpleadosModule],
  controllers: [VeterinariosController],
  providers: [VeterinariosService],
})
export class VeterinariosModule {}
