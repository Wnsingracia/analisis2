import {
  IsOptional,
  IsEmail,
  IsString,
  IsNotEmpty,
  Length,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString({ message: 'Los nombres deben ser texto' })
  @Length(2, 100, { message: 'Los nombres deben tener entre 2 y 100 caracteres' })
  nombres?: string;

  @IsOptional()
  @IsString({ message: 'El apellido paterno debe ser texto' })
  @Length(2, 50, { message: 'El apellido paterno debe tener entre 2 y 50 caracteres' })
  ap_pat?: string;

  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser texto' })
  @Length(2, 50, { message: 'El apellido materno debe tener entre 2 y 50 caracteres' })
  ap_mat?: string;

  @IsOptional()
  @IsString({ message: 'El número celular debe ser válido' })
  cel?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  correo?: string;

  @IsOptional()
  @IsString({ message: 'El género debe ser texto' })
  genero?: string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @Length(6, 255, { message: 'La contraseña debe tener por lo menos 6 caracteres' })
  contrasenia!: string;

  @IsOptional()
  @IsString({ message: 'El tipo de usuario debe ser texto' })
  tipo_usuario?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Los nombres deben ser texto' })
  @Length(2, 100, { message: 'Los nombres deben tener entre 2 y 100 caracteres' })
  nombres?: string;

  @IsOptional()
  @IsString({ message: 'El apellido paterno debe ser texto' })
  @Length(2, 50, { message: 'El apellido paterno debe tener entre 2 y 50 caracteres' })
  ap_pat?: string;

  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser texto' })
  @Length(2, 50, { message: 'El apellido materno debe tener entre 2 y 50 caracteres' })
  ap_mat?: string;

  @IsOptional()
  @IsString({ message: 'El número celular debe ser válido' })
  cel?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  correo?: string;

  @IsOptional()
  @IsString({ message: 'El género debe ser texto' })
  genero?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser texto' })
  @Length(6, 255, { message: 'La contraseña debe tener por lo menos 6 caracteres' })
  contrasenia?: string;

  @IsOptional()
  @IsString({ message: 'El tipo de usuario debe ser texto' })
  tipo_usuario?: string;

  @IsOptional()
  @IsString()
  reset_token?: string;

  @IsOptional()
  @IsString()
  reset_token_expira?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Los intentos fallidos deben ser un número' })
  intentos_fallidos?: number;

  @IsOptional()
  @IsString()
  bloqueado_hasta?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de creación debe tener formato de fecha válido' })
  fecha_creacion?: string;
}