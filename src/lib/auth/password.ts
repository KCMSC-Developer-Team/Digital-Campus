import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12) throw new Error('Password must be at least 12 characters long.');
  if (password.length > 256) throw new Error('Password is too long.');
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })) as Buffer;
  return `scrypt$16384$8$1$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

export async function verifyPassword(password: string, encoded: string | null): Promise<boolean> {
  if (!encoded || password.length > 256) return false;
  const [scheme, n, r, p, saltText, keyText] = encoded.split('$');
  if (scheme !== 'scrypt' || n !== '16384' || r !== '8' || p !== '1' || !saltText || !keyText) return false;
  try {
    const salt = Buffer.from(saltText, 'base64url');
    const expected = Buffer.from(keyText, 'base64url');
    if (expected.length !== KEY_LENGTH || salt.length !== 16) return false;
    const actual = (await scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })) as Buffer;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
