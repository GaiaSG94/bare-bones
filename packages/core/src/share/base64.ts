const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const LOOKUP = new Map<string, number>(
  [...ALPHABET].map((char, index) => [char, index]),
);

export function encodeBase64Url(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    const remaining = bytes.length - i;

    out += ALPHABET[b0 >> 2];
    out += ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    if (remaining > 1) {
      out += ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)];
    }
    if (remaining > 2) {
      out += ALPHABET[b2 & 0x3f];
    }
  }
  return out;
}

export function decodeBase64Url(text: string): Uint8Array {
  const clean = text.replace(/=+$/, "");
  const bytes = new Uint8Array(Math.floor((clean.length * 6) / 8));
  let buffer = 0;
  let bits = 0;
  let index = 0;

  for (const char of clean) {
    const value = LOOKUP.get(char);
    if (value === undefined) {
      throw new Error(`Invalid base64url character: ${char}`);
    }
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[index] = (buffer >> bits) & 0xff;
      index += 1;
    }
  }
  return bytes.subarray(0, index);
}
