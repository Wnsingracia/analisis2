/**
 * Reemplaza las contraseñas con hash FALSO/COMPARTIDO por contraseñas temporales
 * únicas y bien hasheadas (bcrypt, cost 12).
 *
 * Uso (desde la carpeta del backend, con el mismo .env que usa la app):
 *   node scripts/regenerar-hashes-falsos.js            -> solo muestra a quién afectaría
 *   node scripts/regenerar-hashes-falsos.js --aplicar  -> cambia las contraseñas y crea
 *                                                         credenciales_temporales.csv
 *
 * Requiere haber ejecutado antes migracion_parte2.sql (usa la columna token_version).
 * El CSV contiene contraseñas en claro: entrégalo y BÓRRALO.
 */
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');

const HASH_FALSO = '$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6';
const RONDAS = 12;
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; // sin 0/O/1/l/I

function contraseniaTemporal(largo = 14) {
  for (;;) {
    let c = '';
    for (let i = 0; i < largo; i++) c += ALFABETO[crypto.randomInt(ALFABETO.length)];
    if (/[A-Za-z]/.test(c) && /\d/.test(c)) return c; // cumple la política: letra + número
  }
}

async function main() {
  const aplicar = process.argv.includes('--aplicar');
  const db = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();

  const { rows } = await db.query(
    'SELECT id_usuario, correo, tipo_usuario FROM usuarios WHERE contrasenia = $1 ORDER BY id_usuario',
    [HASH_FALSO],
  );
  console.log(`Cuentas con el hash falso compartido: ${rows.length}`);
  if (!aplicar) {
    rows.forEach((r) => console.log(`  ${r.id_usuario}  ${r.tipo_usuario.padEnd(14)} ${r.correo}`));
    console.log('\nNo se cambió nada. Ejecuta con --aplicar para regenerarlas.');
    await db.end();
    return;
  }

  const lineas = ['id_usuario,correo,tipo_usuario,contrasenia_temporal'];
  try {
    await db.query('BEGIN');
    for (const r of rows) {
      const temporal = contraseniaTemporal();
      const hash = await bcrypt.hash(temporal, RONDAS);
      await db.query(
        `UPDATE usuarios
            SET contrasenia = $1, intentos_fallidos = 0, bloqueado_hasta = NULL,
                reset_token = NULL, reset_token_expira = NULL,
                token_version = token_version + 1
          WHERE id_usuario = $2 AND contrasenia = $3`,
        [hash, r.id_usuario, HASH_FALSO],
      );
      lineas.push(`${r.id_usuario},${r.correo},${r.tipo_usuario},${temporal}`);
    }
    await db.query('COMMIT');
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  } finally {
    await db.end();
  }

  fs.writeFileSync('credenciales_temporales.csv', lineas.join('\n') + '\n', { mode: 0o600 });
  console.log(`Listo: ${rows.length} contraseñas regeneradas.`);
  console.log('Credenciales en credenciales_temporales.csv (contiene claves en claro: bórralo después de usarlo).');
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
