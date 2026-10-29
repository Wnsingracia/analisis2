import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export const TIPOS_USUARIO = [
  'ADMIN',
  'CLIENTE',
  'RECEPCIONISTA',
  'VETERINARIO',
  'ESTILISTA',
] as const;

// Datos comunes a cualquier usuario (sin el rol). Los DTO de clientes, veterinarios, etc. lo extienden.
export class DatosPersonalesDto {
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

}

export class CreateUserDto extends DatosPersonalesDto {
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

// ---------- Ciclo de vida de la identidad (Parte 1) ----------

export const ESTADOS_CUENTA = ['ACTIVA', 'SUSPENDIDA', 'REVOCADA'] as const;
export type EstadoCuenta = (typeof ESTADOS_CUENTA)[number];

// Roles entre los que se puede cambiar. CLIENTE no entra: es otra clase de identidad.
export const ROLES_PERSONAL = ['ADMIN', 'VETERINARIO', 'ESTILISTA', 'RECEPCIONISTA'] as const;

export class CambiarEstadoDto {
  @IsIn(ESTADOS_CUENTA, {
    message: `El estado debe ser uno de: ${ESTADOS_CUENTA.join(', ')}`,
  })
  estado!: EstadoCuenta;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  motivo?: string;
}

export class CambiarRolDto {
  @IsString()
  @IsNotEmpty()
  tipo_usuario!: string;

  @IsString({ message: 'Debes indicar el motivo del cambio de rol' })
  @MinLength(3, { message: 'El motivo debe tener al menos 3 caracteres' })
  @MaxLength(300)
  motivo!: string;

  // Datos propios del rol de destino (todos opcionales)
  @IsOptional() @IsString() especializacion?: string; // VETERINARIO
  @IsOptional() @IsString() titulo?: string; // VETERINARIO
  @IsOptional() @IsString() rol?: string; // ESTILISTA
  @IsOptional() @IsString() departamento?: string; // RECEPCIONISTA
  @IsOptional() @IsString() nvl_acceso?: string; // ADMIN

  // Solo se usan si la persona aún no tiene fila de empleado
  @IsOptional() @IsInt() salario?: number;
  @IsOptional() @IsString() hora_ingreso?: string;
  @IsOptional() @IsString() hora_salida?: string;
}
