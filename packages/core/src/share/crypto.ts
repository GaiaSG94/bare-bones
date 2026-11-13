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
