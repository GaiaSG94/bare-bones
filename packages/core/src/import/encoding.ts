const BOM = "\uFEFF";

export type Encoding = "utf-8" | "windows-1252";

export interface DecodedText {
  readonly text: string;
  readonly encoding: Encoding;
}

export function stripBom(text: string): string {
  return text.startsWith(BOM) ? text.slice(BOM.length) : text;
}

export function decodeUtf8Strict(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function decodeWindows1252(bytes: Uint8Array): string {
  return new TextDecoder("windows-1252").decode(bytes);
}

/**
 * Decodes bytes to text. UTF-8 is tried first (fatal, so malformed
 * sequences are detected), with a windows-1252 fallback for legacy
 * spreadsheet exports.
 */
export function decodeText(input: ArrayBuffer | Uint8Array): DecodedText {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const utf8 = decodeUtf8Strict(bytes);
  if (utf8 !== null) {
    return { text: stripBom(utf8), encoding: "utf-8" };
  }
  return { text: stripBom(decodeWindows1252(bytes)), encoding: "windows-1252" };
}
