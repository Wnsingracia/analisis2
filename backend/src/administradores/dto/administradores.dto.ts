import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { DatosPersonalesDto } from '../../usuarios/dto/usuarios.dto';

export class CreateAdministradorDto extends DatosPersonalesDto {
  @IsNotEmpty({ message: 'El nivel de acceso es obligatorio' })
  @IsString({ message: 'El nivel de acceso debe ser texto' })
  @Length(1, 50, { message: 'El nivel de acceso debe tener entre 1 y 50 caracteres' })
  nvl_acceso!: string;
}

export class UpdateAdministradorDto {
  @IsOptional()
  @IsString({ message: 'El nivel de acceso debe ser texto' })
  @Length(1, 50, { message: 'El nivel de acceso debe tener entre 1 y 50 caracteres' })
  nvl_acceso?: string;
}
