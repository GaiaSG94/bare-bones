import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * One-time migration from the approved plank (design/reference/planches/
 * planche-01.html) to the real site sources in site/src.
 * The extracted files are committed; this script is kept for the record.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const plank = readFileSync(join(root, "design/reference/planches/planche-01.html"), "utf8");
const out = join(root, "site/src");
mkdirSync(out, { recursive: true });
const write = (name, text) => writeFileSync(join(out, name), text, "utf8");

// ---- stylesheet ------------------------------------------------------------
const style = plank.match(/<style>([\s\S]*?)<\/style>/)[1];
write("site.css", style.replace(/--stadium: url\(data:image\/jpeg;base64,[A-Za-z0-9+/=]+\)/, "--stadium: url(./stadium.jpg)"));

// ---- scenario script (steps + actors) --------------------------------------
const start = plank.indexOf("window.META = {");
const metaJson = plank.slice(start + "window.META = ".length, plank.indexOf(";\n", start));
write("meta.js", `export const META = ${metaJson};\n`);

// ---- engine (3D scene + scenario player) -----------------------------------
const modules = [...plank.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
let engine = modules[modules.length - 1][1];
engine = engine
  .replace("const META = window.META;", "import { META } from './meta.js';")
  .replace(/\/\*META\{[\s\S]*?\}META\*\//g, "")
  .replace("WebGL indisponible", "WebGL unavailable")
  .replace("// ===================== Bare Bones — moteur des planches =====================", "// ===================== Bare Bones — home page engine =====================")
  .replace("// ===================== fin du moteur — planche =====================", "// ===================== end of the engine =====================");
write("engine.js", engine);

// ---- page ------------------------------------------------------------------
const body = plank.match(/<body>([\s\S]*?)<\/body>/)[1]
  .replace(/\s*<script[\s\S]*?<\/script>/g, "")
  .replace(/href="app-budget\.html"/g, 'href="./budget/"')
  .replace(/href="app-club\.html"/g, 'href="./club/"')
  .replace(/<span class="stat">\+\u20ac3,165 left<\/span>/, '<span class="stat" data-stat="budget">Budget demo</span>')
  .replace(/<span class="stat">Castors <span>23 pts<\/span><\/span>/, '<span class="stat" data-stat="club">League demo</span>')
  .replace('<div class="facts"></div>', '<div class="facts" id="bb-facts"></div>');

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Bare Bones — Drop a spreadsheet. Share an explorer.</title>
<meta name="description" content="Bare Bones turns a plain CSV into a typed table, filters, charts and a share link. Everything happens in the browser: no server, no account.">
<link rel="icon" type="image/svg+xml" href="./favicon.svg">
<meta property="og:title" content="Bare Bones — Drop a spreadsheet. Share an explorer.">
<meta property="og:description" content="A copy-ready data explorer skeleton: two apps, one skeleton, zero server. Kiroween 2026, Skeleton Crew.">
<meta property="og:type" content="website">
<meta property="og:image" content="./social-preview-1280x640.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="./social-preview-1280x640.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap">
</head>
<body>
${body}
<script type="module" src="./app.js"></script>
</body>
</html>
`;
write("index.html", page);
console.log("site/src written");
