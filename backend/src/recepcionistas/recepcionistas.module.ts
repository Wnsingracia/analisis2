import { Module } from '@nestjs/common';
import { RecepcionistasController } from './recepcionistas.controller';
import { RecepcionistasService } from './recepcionistas.service';

@Module({
  controllers: [RecepcionistasController],
  providers: [RecepcionistasService]
})
export class RecepcionistasModule {}
