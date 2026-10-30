import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { CreateClienteDto } from '../../clientes/dto/clientes.dto';

export class LoginDto {
  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contrasenia!: string;
  
  @IsString()
  @IsNotEmpty({message: 'La verificación CAPTCHA es obligatoria'})
  captchaToken!: string;  
}

export class RecuperarDto {
  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  correo!: string;
}

export class RegistroCaptchaDto extends CreateClienteDto {

  @IsString()
  @IsNotEmpty({
    message: 'La verificación CAPTCHA es obligatoria'
  })
  captchaToken!: string;
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