import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateConsultaDto {
  @IsOptional()
  @IsString({ message: 'La fecha debe ser texto' })
  fecha?: string;

  @IsOptional()
  @IsString({ message: 'La hora debe ser texto' })
  hora?: string;

  @IsOptional()
  @IsInt({ message: 'El costo debe ser un número entero' })
  costo?: number;

  @IsOptional()
  @IsString({ message: 'La especialidad debe ser texto' })
  @Length(2, 100, { message: 'La especialidad debe tener entre 2 y 100 caracteres' })
  especialidad?: string;

  @IsOptional()
  @IsString({ message: 'El ambiente debe ser texto' })
  @Length(1, 50, { message: 'El ambiente debe tener entre 1 y 50 caracteres' })
  ambiente?: string;

  // Si quien crea es VETERINARIO se ignora y se usa su propio id.
  @IsOptional()
  @IsNumberString({}, { message: 'El id_veterinario debe ser un identificador válido' })
  id_veterinario?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El id_cita debe ser un identificador válido' })
  id_cita?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El idMascota debe ser un identificador válido' })
  idMascota?: string;
}

export class UpdateConsultaDto extends CreateConsultaDto {}
