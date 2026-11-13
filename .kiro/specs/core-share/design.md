# core-share — Design

## Context

`packages/core/src/share/` builds and reads `#bb=` links. Two modes:
public (view state only, compact) and private (data snapshot encrypted,
key in the fragment). Nothing ever transits a server.

## Decisions

1. **One fragment prefix, two token shapes.**
   `v1.p.<base64url(deflate-raw)>` for public links,
   `v1.s.<base64url(iv|ciphertext)>.<base64url(key)>` for private links.
   The version field keeps room for future formats without breaking old
   links.
2. **Hand-written base64url.** No padding, URL-safe alphabet, so the token
   is a valid fragment on every browser and survives copy-paste.
3. **AES-GCM-256, 12-byte random IV.** The key is 32 random bytes in the
   fragment after the ciphertext; GCM makes the link tamper-evident: a
   modified ciphertext fails authentication.
4. **Fallback is a value, not a crash.** Every decode failure — bad shape,
   bad base64, bad zlib, bad crypto, schema mismatch — is converted to
   `BareBonesError("invalid-share")` so a view can render "this link could
   not be read".
5. **Zod at the boundary.** Decoded payloads are checked with
   `sharePayloadSchema` before use; internals trust the types.

## Testing

Property tests (seed `20261111`): public round-trip, private round-trip,
tampered-link fallback for arbitrary strings, base64url round-trip. Example
tests: wrong key fails, empty fragment fails, token never contains the
plaintext.
