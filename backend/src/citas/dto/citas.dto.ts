import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCitaDto {
  @IsOptional()
  @IsNumberString({}, { message: 'El id_mascota debe ser un identificador válido' })
  id_mascota?: string;

  // Si quien crea es RECEPCIONISTA se ignora y se usa su propio id.
  @IsOptional()
  @IsNumberString({}, { message: 'El id_recepcionista debe ser un identificador válido' })
  id_recepcionista?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El id_cliente debe ser un identificador válido' })
  id_cliente?: string;

  @IsOptional()
  @IsString({ message: 'La fecha debe ser texto' })
  fecha?: string;

  @IsOptional()
  @IsString({ message: 'La hora debe ser texto' })
  hora?: string;

  @IsOptional()
  @IsString({ message: 'El tipo debe ser texto' })
  @Length(2, 50, { message: 'El tipo debe tener entre 2 y 50 caracteres' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;

  @IsOptional()
  @IsInt({ message: 'El costo debe ser un número entero' })
  costo?: number;
}

export class UpdateCitaDto {
  @IsOptional()
  @IsNumberString({}, { message: 'El id_mascota debe ser un identificador válido' })
  id_mascota?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El id_recepcionista debe ser un identificador válido' })
  id_recepcionista?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El id_cliente debe ser un identificador válido' })
  id_cliente?: string;

  @IsOptional()
  @IsString({ message: 'La fecha debe ser texto' })
  fecha?: string;

  @IsOptional()
  @IsString({ message: 'La hora debe ser texto' })
  hora?: string;

  @IsOptional()
  @IsString({ message: 'El tipo debe ser texto' })
  @Length(2, 50, { message: 'El tipo debe tener entre 2 y 50 caracteres' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;

  @IsOptional()
  @IsInt({ message: 'El costo debe ser un número entero' })
  costo?: number;
}
