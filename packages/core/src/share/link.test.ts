import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  buildFragment,
  decodeLink,
  decodePrivateLink,
  decodePrivateLinkWithPassphrase,
  decodePublicLink,
  encodeLink,
  encodePrivateLink,
  encodePrivateLinkWithPassphrase,
  encodePublicLink,
  readFragment,
} from "./link.js";
import { decodeBase64Url, encodeBase64Url } from "./base64.js";
import { createViewState, emptyQuery } from "../state/view-state.js";
import { BareBonesError } from "../types.js";
import type { SharePayload, Table } from "../types.js";

const SEED = 20261111;

const table: Table = {
  id: "budget",
  name: "Budget",
  columns: [{ id: "amount", label: "Amount", type: "number", format: { kind: "number", decimals: 2, locale: "fr" } }],
  rows: [{ amount: 12.5 }],
  rejected: [],
};

function payloadWithTerm(term: string): SharePayload {
  return {
    version: 1,
    state: {
      tableId: "budget",
      viewId: "overview",
      query: { ...emptyQuery(), filters: [{ kind: "text", columnId: "note", term, caseSensitive: false }] },
      options: {},
    },
    data: table,
    meta: {},
  };
}

describe("base64url", () => {
  it("round-trips bytes", () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 64 }), (bytes) => {
        const encoded = encodeBase64Url(bytes);
        expect(encoded).not.toMatch(/[+/=]/);
        expect([...decodeBase64Url(encoded)]).toEqual([...bytes]);
      }),
      { seed: SEED, numRuns: 200 },
    );
  });

  it("rejects invalid characters", () => {
    expect(() => decodeBase64Url("!!")).toThrow();
  });
});

describe("public link", () => {
  it("round-trips a payload", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ maxLength: 40 }), async (term) => {
        const payload = payloadWithTerm(term);
        const token = await encodePublicLink(payload);
        const decoded = await decodePublicLink(token);
        expect(decoded.mode).toBe("public");
        expect(decoded.payload.state.query.filters[0]).toEqual(
          payload.state.query.filters[0],
        );
      }),
      { seed: SEED, numRuns: 30 },
    );
  });

  it("stores the token in the fragment, never in the path", async () => {
    const link = await encodeLink(payloadWithTerm("x"), "public");
    expect(link.startsWith("#bb=")).toBe(true);
    expect(readFragment(link)).not.toBeNull();
  });
});

describe("private link", () => {
  it("round-trips an encrypted payload", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ maxLength: 40 }), async (term) => {
        const payload = payloadWithTerm(term);
        const token = await encodePrivateLink(payload);
        const decoded = await decodePrivateLink(token);
        expect(decoded.mode).toBe("private");
        expect(decoded.key).not.toBeNull();
        expect(decoded.payload.state.query.filters[0]).toEqual(
          payload.state.query.filters[0],
        );
      }),
      { seed: SEED, numRuns: 20 },
    );
  });

  it("does not leak the payload in clear text", async () => {
    const token = await encodePrivateLink(payloadWithTerm("secret-note"));
    expect(token).not.toContain("secret-note");
  });

  it("fails to decrypt with a different key", async () => {
    const token = await encodePrivateLink(payloadWithTerm("secret-note"));
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.${parts[2]}.${encodeBase64Url(new Uint8Array(32))}`;
    await expect(decodePrivateLink(tampered)).rejects.toThrow();
  });
});

describe("passphrase link", () => {
  const PASSPHRASE = "correct horse battery staple";

  it("round-trips a payload and never carries the key", async () => {
    const token = await encodePrivateLinkWithPassphrase(payloadWithTerm("hidden"), PASSPHRASE);
    expect(token.split(".")[1]).toBe("k");
    expect(token).not.toContain("hidden");
    const decoded = await decodePrivateLinkWithPassphrase(token, PASSPHRASE);
    expect(decoded.mode).toBe("private");
    expect(decoded.payload.state.query.filters[0]).toMatchObject({ term: "hidden" });
    expect(decoded.payload.data?.rows[0]).toEqual({ amount: 12.5 });
  });

  it("fails with the fallback error on a wrong passphrase", async () => {
    const token = await encodePrivateLinkWithPassphrase(payloadWithTerm("hidden"), PASSPHRASE);
    await expect(decodePrivateLinkWithPassphrase(token, "wrong")).rejects.toMatchObject({
      code: "invalid-share",
    });
  });

  it("asks for a passphrase when opened through decodeLink", async () => {
    const token = await encodePrivateLinkWithPassphrase(payloadWithTerm("hidden"), PASSPHRASE);
    await expect(decodeLink(buildFragment(token))).rejects.toMatchObject({
      code: "invalid-share",
      detail: "passphrase-required",
    });
  });

  it("rejects a truncated token with the fallback error", async () => {
    const token = await encodePrivateLinkWithPassphrase(payloadWithTerm("hidden"), PASSPHRASE);
    await expect(decodePrivateLinkWithPassphrase(token.slice(0, -4), PASSPHRASE)).rejects.toMatchObject({
      code: "invalid-share",
    });
  });
});

describe("link fallback", () => {
  it("reports a fallback error on an altered link", async () => {
    const link = await encodeLink(payloadWithTerm("x"), "public");
    const altered = `${link.slice(0, -3)}AAA`;
    await expect(decodeLink(altered)).rejects.toMatchObject({ code: "invalid-share" });
  });

  it("reports a fallback error on an empty fragment", async () => {
    await expect(decodeLink("#bb=")).rejects.toMatchObject({ code: "invalid-share" });
  });

  it("reports a fallback error on a foreign fragment", async () => {
    await expect(decodeLink("#other=1")).rejects.toMatchObject({ code: "invalid-share" });
  });

  it("never throws a raw parser error", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ maxLength: 30 }), async (text) => {
        const result = await decodeLink(buildFragment(text)).catch((error) => error);
        expect(result).toBeDefined();
        if (result instanceof BareBonesError) {
          expect(result.code).toBe("invalid-share");
        }
      }),
      { seed: SEED, numRuns: 30 },
    );
  });
});

describe("state round-trip", () => {
  it("restores the same view from a link", async () => {
    const state = createViewState("budget", "overview");
    const link = await encodeLink(
      { version: 1, state, data: table, meta: {} },
      "public",
    );
    const decoded = await decodeLink(link);
    expect(decoded.payload.state.viewId).toBe("overview");
  });
});
