import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateClienteDto {
  @IsNotEmpty({ message: 'El id_usuario es obligatorio' })
  @IsString({ message: 'El id_usuario debe ser una cadena válida' })
  id_usuario!: string;

  @IsOptional()
  @IsString({ message: 'El número de cuenta debe ser texto' })
  @Length(1, 50, { message: 'El número de cuenta debe tener entre 1 y 50 caracteres' })
  nro_cuenta?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @Length(3, 255, { message: 'La dirección debe tener entre 3 y 255 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsString({ message: 'El NIT debe ser un valor válido' })
  nit?: string;
}

export class UpdateClienteDto {
  @IsOptional()
  @IsString({ message: 'El número de cuenta debe ser texto' })
  @Length(1, 50, { message: 'El número de cuenta debe tener entre 1 y 50 caracteres' })
  nro_cuenta?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @Length(3, 255, { message: 'La dirección debe tener entre 3 y 255 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsString({ message: 'El NIT debe ser un valor válido' })
  nit?: string;
}