import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class VerificarDispositivoDto {
  @IsString()
  @IsNotEmpty()
  challengeToken!: string;

  @IsString()
  @IsNotEmpty()
  firma!: string;
}