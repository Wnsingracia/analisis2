import { Module } from '@nestjs/common';
import { VeterinariosController } from './veterinarios.controller';
import { VeterinariosService } from './veterinarios.service';

@Module({
  controllers: [VeterinariosController],
  providers: [VeterinariosService]
})
export class VeterinariosModule {}
