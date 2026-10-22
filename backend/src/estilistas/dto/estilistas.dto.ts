import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateEstilistaDto {
  @IsNotEmpty({ message: 'El id_usuario es obligatorio' })
  @IsString({ message: 'El id_usuario debe ser una cadena válida' })
  id_usuario!: string;

  @IsOptional()
  @IsString({ message: 'El rol debe ser texto' })
  @Length(2, 50, { message: 'El rol debe tener entre 2 y 50 caracteres' })
  rol?: string;
}

export class UpdateEstilistaDto {
  @IsOptional()
  @IsString({ message: 'El rol debe ser texto' })
  @Length(2, 50, { message: 'El rol debe tener entre 2 y 50 caracteres' })
  rol?: string; 
}