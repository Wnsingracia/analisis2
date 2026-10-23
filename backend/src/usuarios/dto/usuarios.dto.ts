import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export const TIPOS_USUARIO = [
  'ADMIN',
  'CLIENTE',
  'RECEPCIONISTA',
  'VETERINARIO',
  'ESTILISTA',
] as const;

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
  @IsNumberString({}, { message: 'El número celular debe contener solo dígitos' })
  cel?: string;

  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  correo!: string;

  @IsOptional()
  @IsString({ message: 'El género debe ser texto' })
  genero?: string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @Length(6, 255, { message: 'La contraseña debe tener por lo menos 6 caracteres' })
  contrasenia!: string;

  @IsIn(TIPOS_USUARIO, {
    message: `El tipo de usuario debe ser uno de: ${TIPOS_USUARIO.join(', ')}`,
  })
  tipo_usuario!: string;
}

// Solo datos personales y contraseña. Los campos de seguridad
// (reset_token, intentos_fallidos, bloqueado_hasta, fecha_creacion)
// y tipo_usuario NO se pueden modificar desde aquí.
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
  @IsNumberString({}, { message: 'El número celular debe contener solo dígitos' })
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
}