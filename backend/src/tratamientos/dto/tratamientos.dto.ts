import { IsOptional, IsString } from 'class-validator';

export class CreateTratamientoDto {
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string; //[cite: 11]

  @IsOptional()
  @IsString({ message: 'La fecha de emisión debe ser texto' })
  fecha_emision?: string; //[cite: 11]

  @IsOptional()
  @IsString({ message: 'El id_cons_medica debe ser un identificador válido' })
  id_cons_medica?: string; //[cite: 11]
}

export class UpdateTratamientoDto {
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string; //[cite: 11]

  @IsOptional()
  @IsString({ message: 'La fecha de emisión debe ser texto' })
  fecha_emision?: string; //[cite: 11]

  @IsOptional()
  @IsString({ message: 'El id_cons_medica debe ser un identificador válido' })
  id_cons_medica?: string; //[cite: 11]
}