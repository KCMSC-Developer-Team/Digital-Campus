import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_OPTIONS = {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

const SCRYPT_PREFIX = "scrypt$16384$8$1";

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      KEY_LENGTH,
      SCRYPT_OPTIONS,
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters long.");
  }

  if (password.length > 256) {
    throw new Error("Password is too long.");
  }

  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await deriveKey(password, salt);

  return [
    SCRYPT_PREFIX,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  encoded: string | null,
): Promise<boolean> {
  if (!encoded || password.length > 256) {
    return false;
  }

  const parts = encoded.split("$");

  if (
    parts.length !== 6 ||
    parts[0] !== "scrypt" ||
    parts[1] !== "16384" ||
    parts[2] !== "8" ||
    parts[3] !== "1" ||
    !parts[4] ||
    !parts[5]
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(parts[4], "base64url");
    const expectedKey = Buffer.from(parts[5], "base64url");

    if (salt.length !== SALT_LENGTH || expectedKey.length !== KEY_LENGTH) {
      return false;
    }

    const actualKey = await deriveKey(password, salt);

    return timingSafeEqual(actualKey, expectedKey);
  } catch {
    return false;
  }
}
