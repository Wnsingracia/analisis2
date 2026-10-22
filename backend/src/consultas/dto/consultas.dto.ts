import { IsOptional, IsString, IsNumber, Length } from 'class-validator';

export class CreateConsultaDto {
  @IsOptional()
  @IsString({ message: 'La fecha debe ser texto' })
  fecha?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'La hora debe ser texto' })
  hora?: string; //[cite: 10]

  @IsOptional()
  @IsNumber({}, { message: 'El costo debe ser numérico' })
  costo?: number; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'La especialidad debe ser texto' })
  @Length(2, 100, { message: 'La especialidad debe tener entre 2 y 100 caracteres' })
  especialidad?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'El ambiente debe ser texto' })
  @Length(1, 50, { message: 'El ambiente debe tener entre 1 y 50 caracteres' })
  ambiente?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'El id_veterinario debe ser un identificador válido' })
  id_veterinario?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'El id_cita debe ser un identificador válido' })
  id_cita?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'El idMascota debe ser un identificador válido' })
  idMascota?: string; //[cite: 10]
}

export class UpdateConsultaDto {
  @IsOptional()
  @IsString({ message: 'La fecha debe ser texto' })
  fecha?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'La hora debe ser texto' })
  hora?: string; //[cite: 10]

  @IsOptional()
  @IsNumber({}, { message: 'El costo debe ser numérico' })
  costo?: number; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'La especialidad debe ser texto' })
  @Length(2, 100, { message: 'La especialidad debe tener entre 2 y 100 caracteres' })
  especialidad?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'El ambiente debe ser texto' })
  @Length(1, 50, { message: 'El ambiente debe tener entre 1 y 50 caracteres' })
  ambiente?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'El id_veterinario debe ser un identificador válido' })
  id_veterinario?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'El id_cita debe ser un identificador válido' })
  id_cita?: string; //[cite: 10]

  @IsOptional()
  @IsString({ message: 'El idMascota debe ser un identificador válido' })
  idMascota?: string; //[cite: 10]
}