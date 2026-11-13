# core-share — Requirements (EARS)

## 1. Public links

**Requirement 1.1** — The system shall serialize a `ViewState` to JSON,
compress it with `CompressionStream('deflate-raw')` and encode it as
base64url in the `#bb=` fragment.

**Requirement 1.2** — The fragment shall never be sent to a server.

## 2. Private links

**Requirement 2.1** — When a private link is created, the system shall
encrypt the payload (view state and data snapshot) with AES-GCM-256 via
WebCrypto.

**Requirement 2.2** — The system shall put the encryption key in the
fragment, after the ciphertext.

**Requirement 2.3** — A private link shall decrypt to exactly the payload
it was created from.

## 3. Robustness

**Requirement 3.1** — When a link is altered, truncated or foreign, the
system shall raise `BareBonesError` with code `invalid-share` and never a
raw parser or crypto exception.

**Requirement 3.2** — When a payload is decoded, the system shall validate
it against the zod schema before returning it.

## 4. Round-trips

**Requirement 4.1** — A public link shall decode to the exact view state it
encoded.
