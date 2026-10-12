import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/lib/auth/password';

describe('password hashing', () => {
  it('hashes and verifies a password without storing the original', async () => {
    const password = 'a-long-unique-test-password-2026';
    const encoded = await hashPassword(password);
    expect(encoded).not.toContain(password);
    expect(await verifyPassword(password, encoded)).toBe(true);
    expect(await verifyPassword('a-different-password', encoded)).toBe(false);
  });
  it('rejects short passwords for account provisioning', async () => {
    await expect(hashPassword('too-short')).rejects.toThrow('at least 12 characters');
  });
});
