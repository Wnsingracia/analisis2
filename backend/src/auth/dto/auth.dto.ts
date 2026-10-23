import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

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

  @IsString()
  @Length(6, 255, {
    message: 'La contraseña debe tener por lo menos 6 caracteres',
  })
  nuevaContrasenia!: string;
}