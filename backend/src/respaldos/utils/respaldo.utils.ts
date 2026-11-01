
/**
 * Utilidades para generar sentencias SQL de respaldo.
 */

/**
 * Escapa identificadores de PostgreSQL:
 * tablas, columnas, esquemas, etc.
 */
export function escaparIdentificador(valor: string): string {
  return `"${valor.replace(/"/g, '""')}"`;
}

/**
 * Convierte valores JavaScript en literales SQL.
 */
export function convertirLiteralSQL(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return 'NULL';
  }

  if (typeof valor === 'boolean') {
    return valor ? 'TRUE' : 'FALSE';
  }

  if (typeof valor === 'number') {
    if (!Number.isFinite(valor)) {
      throw new Error('Valor numérico no válido para SQL');
    }

    return String(valor);
  }

  if (typeof valor === 'bigint') {
    return valor.toString();
  }

  if (Buffer.isBuffer(valor)) {
    return `decode('${valor.toString('hex')}', 'hex')`;
  }

  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) {
      throw new Error('Fecha no válida para SQL');
    }

    return `'${valor.toISOString().replace(/'/g, "''")}'`;
  }

  if (typeof valor === 'object') {
    const json = JSON.stringify(valor);

    if (json === undefined) {
      return 'NULL';
    }

    return `'${json.replace(/'/g, "''")}'`;
  }

  return `'${String(valor).replace(/'/g, "''")}'`;
}

/**
 * Genera una sentencia INSERT.
 */
export function generarInsertSQL(
  esquema: string,
  tabla: string,
  columnas: string[],
  valores: unknown[],
): string {
  if (columnas.length !== valores.length) {
    throw new Error(
      `Cantidad de columnas y valores diferente en ${tabla}`,
    );
  }

  if (columnas.length === 0) {
    return `INSERT INTO ${escaparIdentificador(esquema)}.${escaparIdentificador(tabla)} DEFAULT VALUES;`;
  }

  const nombres = columnas
    .map(escaparIdentificador)
    .join(', ');

  const datos = valores
    .map(convertirLiteralSQL)
    .join(', ');

  return (
    `INSERT INTO ${escaparIdentificador(esquema)}.` +
    `${escaparIdentificador(tabla)} (${nombres}) ` +
    `VALUES (${datos});`
  );
}
