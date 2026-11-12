import {
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CrearDesafioDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, {
    message: 'El identificador del dispositivo debe ser numérico.',
  })
  idDispositivo!: string;
}