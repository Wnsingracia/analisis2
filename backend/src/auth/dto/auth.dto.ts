import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { PoliticaContrasenia } from '../../common/contrasenia';

export class LoginDto {
  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contrasenia!: string;
}

export class RecuperarDto {
  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  correo!: string;
}

export class RestablecerDto {
  @IsString()
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token!: string;

  @PoliticaContrasenia()
  nuevaContrasenia!: string;
}

// Código TOTP de 6 dígitos
export class CodigoDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'El código debe tener 6 dígitos' })
  codigo!: string;
}
