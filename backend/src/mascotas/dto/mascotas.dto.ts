import { IsNotEmpty, IsOptional, IsString, IsNumber, Length } from 'class-validator';

export class CreateMascotaDto {
  @IsNotEmpty({ message: 'El id_cliente es obligatorio' })
  @IsString({ message: 'El id_cliente debe ser una cadena válida' })
  id_cliente!: string; //[cite: 7]

  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre?: string; //[cite: 7]

  @IsOptional()
  @IsString({ message: 'El tipo de mascota debe ser texto' })
  @Length(1, 50, { message: 'El tipo debe tener entre 1 y 50 caracteres' })
  tipo?: string; //[cite: 7]

  @IsOptional()
  @IsString({ message: 'La raza debe ser texto' })
  @Length(1, 50, { message: 'La raza debe tener entre 1 y 50 caracteres' })
  raza?: string; //[cite: 7]

  @IsOptional()
  @IsNumber({}, { message: 'La edad debe ser un número entero' })
  edad?: number; //[cite: 7]

  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un número válido' })
  peso?: number; //[cite: 7]

  @IsOptional()
  @IsNumber({}, { message: 'La altura debe ser un número válido' })
  altura?: number; //[cite: 7]

  @IsOptional()
  @IsString({ message: 'Las alergias deben ser texto' })
  alergias?: string; //[cite: 7]

  @IsOptional()
  @IsString({ message: 'El género debe ser texto' })
  genero?: string; //[cite: 7]
}

export class UpdateMascotaDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre?: string; //[cite: 7]

  @IsOptional()
  @IsString({ message: 'El tipo de mascota debe ser texto' })
  @Length(1, 50, { message: 'El tipo debe tener entre 1 y 50 caracteres' })
  tipo?: string; //[cite: 7]

  @IsOptional()
  @IsString({ message: 'La raza debe ser texto' })
  @Length(1, 50, { message: 'La raza debe tener entre 1 y 50 caracteres' })
  raza?: string; //[cite: 7]

  @IsOptional()
  @IsNumber({}, { message: 'La edad debe ser un número entero' })
  edad?: number; //[cite: 7]

  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un número válido' })
  peso?: number; //[cite: 7]

  @IsOptional()
  @IsNumber({}, { message: 'La altura debe ser un número válido' })
  altura?: number; //[cite: 7]

  @IsOptional()
  @IsString({ message: 'Las alergias deben ser texto' })
  alergias?: string; //[cite: 7]

  @IsOptional()
  @IsString({ message: 'El género debe ser texto' })
  genero?: string; //[cite: 7]
}