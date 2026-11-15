#!/usr/bin/env node
/** Tiny static server for the built sites (used by Playwright). */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "../site/dist"));
const port = Number(process.argv[3] ?? 4170);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".csv": "text/csv; charset=utf-8",
};

createServer((request, response) => {
  const url = decodeURIComponent((request.url ?? "/").split("?")[0]);
  let file = join(root, normalize(url).replace(/^([/\\])+/, ""));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    response.writeHead(404, { "content-type": "text/plain" });
    response.end("not found");
    return;
  }
  response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}/`));
