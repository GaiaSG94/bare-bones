import type { SharePayload } from "../types.js";

const IV_LENGTH = 12;

export interface EncryptedBlob {
  readonly iv: Uint8Array;
  readonly ciphertext: Uint8Array;
}

function asBufferSource(bytes: Uint8Array): BufferSource {
  return bytes as unknown as BufferSource;
}

export function generateKey(): Uint8Array {
  const key = new Uint8Array(32);
  globalThis.crypto.getRandomValues(key);
  return key;
}

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;

/**
 * Derives an AES key material from a human passphrase (PBKDF2-SHA-256).
 * The salt travels with the link; the passphrase never does.
 */
export function newSalt(): Uint8Array {
  const salt = new Uint8Array(SALT_LENGTH);
  globalThis.crypto.getRandomValues(salt);
  return salt;
}

export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const material = await globalThis.crypto.subtle.importKey(
    "raw",
    asBufferSource(new TextEncoder().encode(passphrase)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: asBufferSource(salt), iterations: PBKDF2_ITERATIONS },
    material,
    256,
  );
  return new Uint8Array(bits);
}

async function importKey(key: Uint8Array): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    "raw",
    asBufferSource(key),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encrypt(
  plaintext: string,
  key: Uint8Array,
): Promise<EncryptedBlob> {
  const iv = new Uint8Array(IV_LENGTH);
  globalThis.crypto.getRandomValues(iv);
  const cryptoKey = await importKey(key);
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    cryptoKey,
    asBufferSource(new TextEncoder().encode(plaintext)),
  );
  return { iv, ciphertext: new Uint8Array(encrypted) };
}

export async function decrypt(
  blob: EncryptedBlob,
  key: Uint8Array,
): Promise<string> {
  const cryptoKey = await importKey(key);
  const decrypted = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: asBufferSource(blob.iv) },
    cryptoKey,
    asBufferSource(blob.ciphertext),
  );
  return new TextDecoder().decode(decrypted);
}

export function serializePayload(payload: SharePayload): string {
  return JSON.stringify(payload);
}

export function parsePayload(text: string): SharePayload {
  return JSON.parse(text) as SharePayload;
}
