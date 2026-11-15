import type { SharePayload } from "../types.js";
import { BareBonesError } from "../types.js";
import { decodeBase64Url, encodeBase64Url } from "./base64.js";
import { deflateRaw, inflateRaw } from "./compress.js";
import {
  decrypt,
  deriveKeyFromPassphrase,
  encrypt,
  generateKey,
  newSalt,
  parsePayload,
  serializePayload,
} from "./crypto.js";
import { sharePayloadSchema } from "../schema.js";

export const SHARE_PREFIX = "bb=";
export const SHARE_VERSION = "v1";

export type ShareMode = "public" | "private";

export interface DecodedShare {
  readonly mode: ShareMode;
  readonly payload: SharePayload;
  readonly key: Uint8Array | null;
}

export function shareError(detail: string): BareBonesError {
  return new BareBonesError(
    "invalid-share",
    "This link could not be read. It may have been truncated or edited.",
    detail,
  );
}

function parseChecked(text: string): SharePayload {
  const parsed = sharePayloadSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw shareError(`payload does not match the schema: ${parsed.error.message}`);
  }
  return parsed.data;
}

export async function encodePublicLink(payload: SharePayload): Promise<string> {
  const bytes = await deflateRaw(serializePayload(payload));
  return `${SHARE_VERSION}.p.${encodeBase64Url(bytes)}`;
}

export async function decodePublicLink(token: string): Promise<DecodedShare> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== SHARE_VERSION || parts[1] !== "p") {
      throw shareError("unexpected public token shape");
    }
    const compressed = decodeBase64Url(parts[2] ?? "");
    const text = await inflateRaw(compressed);
    return { mode: "public", payload: parseChecked(text), key: null };
  } catch (error) {
    throw asShareError(error);
  }
}

/**
 * Private link: the data snapshot is encrypted with AES-GCM-256. The key
 * travels in the fragment, after the ciphertext, and never leaves the
 * browser.
 */
export async function encodePrivateLink(payload: SharePayload): Promise<string> {
  const key = generateKey();
  const blob = await encrypt(serializePayload(payload), key);
  const combined = new Uint8Array(blob.iv.length + blob.ciphertext.length);
  combined.set(blob.iv, 0);
  combined.set(blob.ciphertext, blob.iv.length);
  return `${SHARE_VERSION}.s.${encodeBase64Url(combined)}.${encodeBase64Url(key)}`;
}

export async function decodePrivateLink(token: string): Promise<DecodedShare> {
  try {
    const parts = token.split(".");
    if (parts.length !== 4 || parts[0] !== SHARE_VERSION || parts[1] !== "s") {
      throw shareError("unexpected private token shape");
    }
    const combined = decodeBase64Url(parts[2] ?? "");
    const key = decodeBase64Url(parts[3] ?? "");
    if (combined.length <= 12) {
      throw shareError("ciphertext too short");
    }
    const blob = {
      iv: combined.subarray(0, 12),
      ciphertext: combined.subarray(12),
    };
    const text = await decrypt(blob, key);
    return { mode: "private", payload: parseChecked(text), key };
  } catch (error) {
    throw asShareError(error);
  }
}

/**
 * Passphrase link (`v1.k.`): the key is derived from the passphrase and
 * never travels in the fragment. The salt must, so the same passphrase
 * derives the same key.
 */
export async function encodePrivateLinkWithPassphrase(
  payload: SharePayload,
  passphrase: string,
): Promise<string> {
  const salt = newSalt();
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const blob = await encrypt(serializePayload(payload), key);
  const combined = new Uint8Array(blob.iv.length + blob.ciphertext.length);
  combined.set(blob.iv, 0);
  combined.set(blob.ciphertext, blob.iv.length);
  return `${SHARE_VERSION}.k.${encodeBase64Url(salt)}.${encodeBase64Url(combined)}`;
}

export async function decodePrivateLinkWithPassphrase(
  token: string,
  passphrase: string,
): Promise<DecodedShare> {
  try {
    const parts = token.split(".");
    if (parts.length !== 4 || parts[0] !== SHARE_VERSION || parts[1] !== "k") {
      throw shareError("unexpected passphrase token shape");
    }
    const salt = decodeBase64Url(parts[2] ?? "");
    const combined = decodeBase64Url(parts[3] ?? "");
    if (combined.length <= 12) {
      throw shareError("ciphertext too short");
    }
    const key = await deriveKeyFromPassphrase(passphrase, salt);
    const text = await decrypt({ iv: combined.subarray(0, 12), ciphertext: combined.subarray(12) }, key);
    return { mode: "private", payload: parseChecked(text), key };
  } catch (error) {
    throw asShareError(error);
  }
}

function asShareError(error: unknown): BareBonesError {
  if (error instanceof BareBonesError) return error;
  const detail = error instanceof Error ? error.message : String(error);
  return shareError(detail);
}

export function buildFragment(token: string): string {
  return `#${SHARE_PREFIX}${token}`;
}

export function readFragment(hash: string): string | null {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!clean.startsWith(SHARE_PREFIX)) return null;
  return clean.slice(SHARE_PREFIX.length);
}

export async function encodeLink(
  payload: SharePayload,
  mode: ShareMode,
): Promise<string> {
  const token =
    mode === "private" ? await encodePrivateLink(payload) : await encodePublicLink(payload);
  return buildFragment(token);
}

export async function decodeLink(hash: string): Promise<DecodedShare> {
  const token = readFragment(hash);
  if (token === null || token === "") {
    throw shareError("no share token in fragment");
  }
  if (token.includes(".k.")) {
    throw shareError("passphrase-required");
  }
  return token.includes(".s.") ? decodePrivateLink(token) : decodePublicLink(token);
}
