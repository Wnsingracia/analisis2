import { Module } from '@nestjs/common';
import { EstilistasController } from './estilistas.controller';
import { EstilistasService } from './estilistas.service';

@Module({
  controllers: [EstilistasController],
  providers: [EstilistasService]
})
export class EstilistasModule {}
