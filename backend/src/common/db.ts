import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';

export type OperacionDb = 'crear' | 'actualizar' | 'eliminar';

/**
 * Traduce errores de Postgres a respuestas HTTP claras.
 * Nunca devuelve al cliente el mensaje interno de la base de datos.
 */
export function lanzarErrorDb(
  error: unknown,
  logger: Logger,
  operacion: OperacionDb,
  entidad: string, // ej: 'el cliente', 'la mascota'
): never {
  if (error instanceof HttpException) throw error;

  const e = error as any;
  const codigo: string | undefined = e?.driverError?.code ?? e?.code;

  switch (codigo) {
    case '23505': // unique_violation
      throw new ConflictException(`Ya existe ${entidad} con esos datos.`);
    case '23503': // foreign_key_violation
      if (operacion === 'eliminar') {
        throw new ConflictException(
          `No se puede eliminar ${entidad}: tiene registros relacionados.`,
        );
      }
      throw new BadRequestException(
        'Alguno de los identificadores enviados no existe.',
      );
    case '23502': // not_null_violation
      throw new BadRequestException('Falta un dato obligatorio.');
    case '22P02': // formato inválido
    case '22003': // fuera de rango
      throw new BadRequestException(
        'Alguno de los valores tiene un formato o rango inválido.',
      );
  }

  logger.error(`Error al ${operacion} ${entidad}`, e?.stack ?? String(error));
  throw new InternalServerErrorException(`No se pudo ${operacion} ${entidad}.`);
}

/**
 * Siguiente id para tablas sin secuencia/identity (citas, consultas, tratamientos).
 * Debe llamarse DENTRO de una transacción: el lock se libera al terminar,
 * así dos inserciones simultáneas no obtienen el mismo id.
 * `tabla` y `columna` son constantes del código, nunca datos del usuario.
 */
export async function siguienteId(
  manager: EntityManager,
  tabla: string,
  columna: string,
): Promise<string> {
  await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [tabla]);
  const filas = await manager.query(
    `SELECT COALESCE(MAX("${columna}"), 0) + 1 AS id FROM "${tabla}"`,
  );
  return String(filas[0].id);
}

/** Quita las claves con valor undefined para armar un UPDATE parcial. */
export function sinUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, valor]) => valor !== undefined),
  ) as Partial<T>;
}
