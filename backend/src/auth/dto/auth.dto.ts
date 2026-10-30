import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { CreateClienteDto } from '../../clientes/dto/clientes.dto';
import { PoliticaContrasenia } from '../../common/contrasenia';

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

  @PoliticaContrasenia()
  nuevaContrasenia!: string;
}

// Código TOTP de 6 dígitos
export class CodigoDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'El código debe tener 6 dígitos' })
  codigo!: string;
}
