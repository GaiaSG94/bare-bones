import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../../");
const siteDist = resolve(root, "site/dist");

describe("site build — social preview image", () => {
  it("ships social-preview-1280x640.png at the site root", () => {
    const imagePath = resolve(siteDist, "social-preview-1280x640.png");
    expect(
      existsSync(imagePath),
      `social-preview-1280x640.png is missing from ${siteDist} — run pnpm build first`,
    ).toBe(true);
  });
});
