import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateEmpleadoDto {
  @IsNotEmpty({ message: 'El id_usuario es obligatorio' })
  @IsString({ message: 'El id_usuario debe ser una cadena válida' })
  id_usuario!: string; //[cite: 5]

  @IsOptional()
  @IsNumber({}, { message: 'El salario debe ser un valor numérico válido' })
  salario?: number; //[cite: 5]

  @IsOptional()
  @IsString({ message: 'La hora de ingreso debe ser texto' })
  hora_ingreso?: string; //[cite: 5]

  @IsOptional()
  @IsString({ message: 'La hora de salida debe ser texto' })
  hora_salida?: string; //[cite: 5]
}

export class UpdateEmpleadoDto {
  @IsOptional()
  @IsNumber({}, { message: 'El salario debe ser un valor numérico válido' })
  salario?: number; //[cite: 5]

  @IsOptional()
  @IsString({ message: 'La hora de ingreso debe ser texto' })
  hora_ingreso?: string; //[cite: 5]

  @IsOptional()
  @IsString({ message: 'La hora de salida debe ser texto' })
  hora_salida?: string; //[cite: 5]
}