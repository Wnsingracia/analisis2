import { applyDecorators } from '@nestjs/common';
import { IsString, Length, Matches } from 'class-validator';
import * as bcrypt from 'bcrypt';

// Parte 2-b: función de derivación de claves (bcrypt) con parámetros apropiados
export const BCRYPT_ROUNDS = 12;

// Política de contraseñas
export const CONTRASENIA_MIN = 12;
export const CONTRASENIA_MAX = 72; // bcrypt solo usa los primeros 72 bytes
export const MENSAJE_POLITICA =
  `La contraseña debe tener entre ${CONTRASENIA_MIN} y ${CONTRASENIA_MAX} caracteres ` +
  'e incluir al menos una letra y un número.';

export const cumplePolitica = (c: unknown): boolean =>
  typeof c === 'string' &&
  c.length >= CONTRASENIA_MIN &&
  c.length <= CONTRASENIA_MAX &&
  /[A-Za-z]/.test(c) &&
  /\d/.test(c);
/** Decorador de DTO: aplica la política a una contraseña nueva. */
export const PoliticaContrasenia = () =>
  applyDecorators(
    IsString({ message: 'La contraseña debe ser texto' }),
    Length(CONTRASENIA_MIN, CONTRASENIA_MAX, { message: MENSAJE_POLITICA }),
    Matches(/(?=.*[A-Za-z])(?=.*\d)/, { message: MENSAJE_POLITICA }),
  );

// Hash descartable. Se compara contra él cuando la cuenta no existe o está
// bloqueada, para que el tiempo de respuesta no delate si el correo existe.
export const HASH_FALSO = bcrypt.hashSync('descartable-vetcare-no-es-una-clave', BCRYPT_ROUNDS);
