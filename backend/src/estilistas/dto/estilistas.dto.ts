import { IsOptional, IsString, Length } from 'class-validator';
import { DatosPersonalEmpleadoDto } from '../../empleados/dto/empleado.dto';

export class CreateEstilistaDto extends DatosPersonalEmpleadoDto {
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
