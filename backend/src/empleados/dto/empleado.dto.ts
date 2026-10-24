import { IsInt, IsOptional, IsString } from 'class-validator';
import { DatosPersonalesDto } from '../../usuarios/dto/usuarios.dto';

// Un empleado no se crea solo: nace junto con su rol (veterinario, estilista o recepcionista).
export class DatosEmpleadoDto {
  @IsOptional()
  @IsInt({ message: 'El salario debe ser un número entero' })
  salario?: number;

  @IsOptional()
  @IsString({ message: 'La hora de ingreso debe ser texto' })
  hora_ingreso?: string;

  @IsOptional()
  @IsString({ message: 'La hora de salida debe ser texto' })
  hora_salida?: string;
}

// Base de los DTO de creación de veterinarios, estilistas y recepcionistas
export class DatosPersonalEmpleadoDto extends DatosPersonalesDto {
  @IsOptional()
  @IsInt({ message: 'El salario debe ser un número entero' })
  salario?: number;

  @IsOptional()
  @IsString({ message: 'La hora de ingreso debe ser texto' })
  hora_ingreso?: string;

  @IsOptional()
  @IsString({ message: 'La hora de salida debe ser texto' })
  hora_salida?: string;
}

export class UpdateEmpleadoDto extends DatosEmpleadoDto {}
