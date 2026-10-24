import { IsNumberString, IsOptional, IsString, Length } from 'class-validator';
import { DatosPersonalesDto } from '../../usuarios/dto/usuarios.dto';

// Crea el usuario (rol CLIENTE) y su fila de clientes en una sola operación.
// No incluye tipo_usuario: el rol lo fija el servidor.
export class CreateClienteDto extends DatosPersonalesDto {
  @IsOptional()
  @IsString({ message: 'El número de cuenta debe ser texto' })
  @Length(1, 50, { message: 'El número de cuenta debe tener entre 1 y 50 caracteres' })
  nro_cuenta?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @Length(3, 255, { message: 'La dirección debe tener entre 3 y 255 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El NIT debe contener solo dígitos' })
  nit?: string;
}

export class UpdateClienteDto {
  @IsOptional()
  @IsString({ message: 'El número de cuenta debe ser texto' })
  @Length(1, 50, { message: 'El número de cuenta debe tener entre 1 y 50 caracteres' })
  nro_cuenta?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @Length(3, 255, { message: 'La dirección debe tener entre 3 y 255 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El NIT debe contener solo dígitos' })
  nit?: string;
}
