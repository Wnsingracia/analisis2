import * as crypto from 'crypto';

// TOTP (RFC 6238) con HMAC-SHA1, 6 dígitos y paso de 30 s: compatible con
// Google Authenticator, Microsoft Authenticator, Authy, etc. Sin dependencias externas.

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const PERIODO_S = 30;

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let valor = 0;
  let salida = '';
  for (const byte of buf) {
    valor = (valor << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      salida += B32[(valor >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) salida += B32[(valor << (5 - bits)) & 31];
  return salida;
}

export function base32Decode(texto: string): Buffer {
  const limpio = texto.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0;
  let valor = 0;
  const bytes: number[] = [];
  for (const c of limpio) {
    const i = B32.indexOf(c);
    if (i < 0) throw new Error('Base32 inválido');
    valor = (valor << 5) | i;
    bits += 5;
    if (bits >= 8) {
      bytes.push((valor >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function hotp(secreto: Buffer, contador: number, digitos = 6): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(contador));
  const h = crypto.createHmac('sha1', secreto).update(buf).digest();
  const off = h[h.length - 1] & 0xf;
  const codigo =
    ((h[off] & 0x7f) << 24) | ((h[off + 1] & 0xff) << 16) | ((h[off + 2] & 0xff) << 8) | (h[off + 3] & 0xff);
  return String(codigo % 10 ** digitos).padStart(digitos, '0');
}

export const pasoActual = (ahoraMs = Date.now()) => Math.floor(ahoraMs / 1000 / PERIODO_S);

/** Devuelve el paso de tiempo en el que el código es válido (tolera ±1 paso) o null. */
export function verificarTotp(secretoBase32: string, codigo: string, ahoraMs = Date.now()): number | null {
  if (!/^\d{6}$/.test(codigo)) return null;
  const secreto = base32Decode(secretoBase32);
  const base = pasoActual(ahoraMs);
  for (const delta of [0, -1, 1]) {
    const paso = base + delta;
    if (crypto.timingSafeEqual(Buffer.from(hotp(secreto, paso)), Buffer.from(codigo))) return paso;
  }
  return null;
}

// ---- Cifrado del secreto en la base de datos (AES-256-GCM) ----
// La clave sale de TOTP_KEY (o, si no existe, de JWT_SECRET). El secreto nunca se guarda en claro.
const clave = () =>
  crypto.createHash('sha256').update(process.env.TOTP_KEY ?? process.env.JWT_SECRET ?? '').digest();

export function cifrar(texto: string): string {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', clave(), iv);
  const enc = Buffer.concat([c.update(texto, 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString('base64')).join('.');
}

export function descifrar(payload: string): string {
  const [iv, tag, enc] = payload.split('.').map((p) => Buffer.from(p, 'base64'));
  const d = crypto.createDecipheriv('aes-256-gcm', clave(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
}
