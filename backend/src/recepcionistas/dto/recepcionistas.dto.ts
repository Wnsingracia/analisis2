import { IsOptional, IsString, Length } from 'class-validator';
import { DatosPersonalEmpleadoDto } from '../../empleados/dto/empleado.dto';

export class CreateRecepcionistaDto extends DatosPersonalEmpleadoDto {
  @IsOptional()
  @IsString({ message: 'El departamento debe ser texto' })
  @Length(2, 100, { message: 'El departamento debe tener entre 2 y 100 caracteres' })
  departamento?: string;
}

export class UpdateRecepcionistaDto {
  @IsOptional()
  @IsString({ message: 'El departamento debe ser texto' })
  @Length(2, 100, { message: 'El departamento debe tener entre 2 y 100 caracteres' })
  departamento?: string;
}
