import { IsOptional, IsString, IsNumber, Length } from 'class-validator';

export class CreateCitaDto {
  @IsOptional()
  @IsString({ message: 'El id_mascota debe ser una cadena válida' })
  id_mascota?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'El id_recepcionista debe ser una cadena válida' })
  id_recepcionista?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'El id_cliente debe ser una cadena válida' })
  id_cliente?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'La fecha debe ser texto' })
  fecha?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'La hora debe ser texto' })
  hora?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'El tipo debe ser texto' })
  @Length(2, 50, { message: 'El tipo debe tener entre 2 y 50 caracteres' })
  tipo?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string; //[cite: 9]

  @IsOptional()
  @IsNumber({}, { message: 'El costo debe ser numérico' })
  costo?: number; //[cite: 9]
}

export class UpdateCitaDto {
  @IsOptional()
  @IsString({ message: 'El id_mascota debe ser una cadena válida' })
  id_mascota?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'El id_recepcionista debe ser una cadena válida' })
  id_recepcionista?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'El id_cliente debe ser una cadena válida' })
  id_cliente?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'La fecha debe ser texto' })
  fecha?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'La hora debe ser texto' })
  hora?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'El tipo debe ser texto' })
  @Length(2, 50, { message: 'El tipo debe tener entre 2 y 50 caracteres' })
  tipo?: string; //[cite: 9]

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string; //[cite: 9]

  @IsOptional()
  @IsNumber({}, { message: 'El costo debe ser numérico' })
  costo?: number; //[cite: 9]
}