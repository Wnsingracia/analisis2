import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateAdministradorDto {
  @IsNotEmpty({ message: 'El id_usuario es obligatorio' })
  @IsString({ message: 'El id_usuario debe ser un numero válido' })
  id_usuario!: number; 

  @IsNotEmpty()
  @IsString({ message: 'El nivel de acceso debe ser texto' })
  @Length(1, 50, { message: 'El nivel de acceso debe tener entre 1 y 50 caracteres' })
  nvl_acceso?: string;
}

export class UpdateAdministradorDto {
  @IsOptional()
  @IsString({ message: 'El nivel de acceso debe ser texto' })
  @Length(1, 50, { message: 'El nivel de acceso debe tener entre 1 y 50 caracteres' })
  nvl_acceso?: string;
}