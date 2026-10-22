import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateDepartamentoDto {
  @IsNotEmpty({ message: 'El id_usuario es obligatorio' })
  @IsString({ message: 'El id_usuario debe ser una cadena válida' })
  id_usuario!: string; //[cite: 8]

  @IsOptional()
  @IsString({ message: 'El departamento debe ser texto' })
  @Length(2, 100, { message: 'El departamento debe tener entre 2 y 100 caracteres' })
  departamento?: string; //[cite: 8]
}

export class UpdateDepartamentoDto {
  @IsOptional()
  @IsString({ message: 'El departamento debe ser texto' })
  @Length(2, 100, { message: 'El departamento debe tener entre 2 y 100 caracteres' })
  departamento?: string; //[cite: 8]
}