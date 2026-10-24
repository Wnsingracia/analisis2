import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateTratamientoDto {
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;

  @IsOptional()
  @IsString({ message: 'La fecha de emisión debe ser texto' })
  fecha_emision?: string;

  // Todo tratamiento pertenece a una consulta
  @IsNotEmpty({ message: 'El id_cons_medica es obligatorio' })
  @IsNumberString({}, { message: 'El id_cons_medica debe ser un identificador válido' })
  id_cons_medica!: string;
}

export class UpdateTratamientoDto {
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;

  @IsOptional()
  @IsString({ message: 'La fecha de emisión debe ser texto' })
  fecha_emision?: string;

  // Solo ADMIN puede mover un tratamiento a otra consulta
  @IsOptional()
  @IsNumberString({}, { message: 'El id_cons_medica debe ser un identificador válido' })
  id_cons_medica?: string;
}
