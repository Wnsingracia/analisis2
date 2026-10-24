import {
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateMascotaDto {
  // Staff: obligatorio. Si quien crea es un CLIENTE se ignora y se usa su propio id.
  @IsOptional()
  @IsNumberString({}, { message: 'El id_cliente debe ser un identificador válido' })
  id_cliente?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El tipo de mascota debe ser texto' })
  @Length(1, 50, { message: 'El tipo debe tener entre 1 y 50 caracteres' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'La raza debe ser texto' })
  @Length(1, 50, { message: 'La raza debe tener entre 1 y 50 caracteres' })
  raza?: string;

  @IsOptional()
  @IsInt({ message: 'La edad debe ser un número entero' })
  edad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un número válido' })
  peso?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La altura debe ser un número válido' })
  altura?: number;

  @IsOptional()
  @IsString({ message: 'Las alergias deben ser texto' })
  alergias?: string;

  @IsOptional()
  @IsString({ message: 'El género debe ser texto' })
  genero?: string;
}

// El dueño (id_cliente) no se puede cambiar desde aquí.
export class UpdateMascotaDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El tipo de mascota debe ser texto' })
  @Length(1, 50, { message: 'El tipo debe tener entre 1 y 50 caracteres' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'La raza debe ser texto' })
  @Length(1, 50, { message: 'La raza debe tener entre 1 y 50 caracteres' })
  raza?: string;

  @IsOptional()
  @IsInt({ message: 'La edad debe ser un número entero' })
  edad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un número válido' })
  peso?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La altura debe ser un número válido' })
  altura?: number;

  @IsOptional()
  @IsString({ message: 'Las alergias deben ser texto' })
  alergias?: string;

  @IsOptional()
  @IsString({ message: 'El género debe ser texto' })
  genero?: string;
}
