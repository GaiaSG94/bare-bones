#!/usr/bin/env node
/**
 * Shared helper: read a file, normalise line endings, and hash it with SHA-256.
 * Using LF-normalisation makes the hash identical on Windows (CRLF) and Linux (LF).
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/**
 * @param {string} filePath - absolute path to the file
 * @returns {string} - hex SHA-256 digest of the LF-normalised content
 */
export function hashFile(filePath) {
  const raw = readFileSync(filePath);
  const normalised = raw.toString("utf8").replace(/\r\n/g, "\n");
  return createHash("sha256").update(normalised).digest("hex");
}
