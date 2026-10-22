import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateVeterinarioDto {
  @IsNotEmpty({ message: 'El id_usuario es obligatorio' })
  @IsString({ message: 'El id_usuario debe ser una cadena válida' })
  id_usuario!: string;

  @IsOptional()
  @IsString({ message: 'La especialización debe ser texto' })
  @Length(2, 100, { message: 'La especialización debe tener entre 2 y 100 caracteres' })
  especializacion?: string;

  @IsOptional()
  @IsString({ message: 'El título debe ser texto' })
  @Length(2, 100, { message: 'El título debe tener entre 2 y 100 caracteres' })
  titulo?: string;
}

export class UpdateVeterinarioDto {
  @IsOptional()
  @IsString({ message: 'La especialización debe ser texto' })
  @Length(2, 100, { message: 'La especialización debe tener entre 2 y 100 caracteres' })
  especializacion?: string;

  @IsOptional()
  @IsString({ message: 'El título debe ser texto' })
  @Length(2, 100, { message: 'El título debe tener entre 2 y 100 caracteres' })
  titulo?: string;
}