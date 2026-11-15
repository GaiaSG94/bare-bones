import { useState } from "react";
import type { ShareMode, SharePayload } from "@bare-bones/core";
import { encodePrivateLinkWithPassphrase } from "@bare-bones/core";
import { useEffect } from "react";
import { useShareLink } from "./useShareLink.js";

export interface ShareCardProps {
  readonly title: string;
  readonly payload: SharePayload;
  readonly defaultMode?: ShareMode | undefined;
  readonly publicLabel?: string | undefined | undefined;
  readonly privateLabel?: string | undefined | undefined;
  /** Offers a third mode: private, key derived from a passphrase. */
  readonly passphrase?: boolean | undefined;
}

type CardMode = ShareMode | "passphrase";

/**
 * Share panel: public (compact link), private (encrypted snapshot with
 * the key in the fragment) and — optionally — private with a passphrase
 * (the key is derived from the passphrase and never travels).
 */
export function ShareCard({
  title,
  payload,
  defaultMode = "private",
  publicLabel = "Public link",
  privateLabel = "Private link",
  passphrase = false,
}: ShareCardProps) {
  const [mode, setMode] = useState<CardMode>(defaultMode);
  const [copied, setCopied] = useState(false);
  const [pass, setPass] = useState("");
  const [linkOverride, setLinkOverride] = useState<string | null>(null);
  const { link, error } = useShareLink(payload, mode === "passphrase" ? "private" : mode);

  useEffect(() => {
    if (mode !== "passphrase" || pass === "") return;
    let cancelled = false;
    encodePrivateLinkWithPassphrase(payload, pass).then((token) => {
      if (!cancelled) setLinkOverride(`#bb=${token}`);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, pass, payload]);
  const shown = mode === "passphrase" ? (linkOverride ?? "") : link;

  const copy = async () => {
    if (shown === "") return;
    try {
      await navigator.clipboard.writeText(fullUrl(shown));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="bb-share" aria-label={title}>
      <h3>{title}</h3>
      <div className="bb-share-modes" role="group" aria-label="Share mode">
        <button type="button" aria-pressed={mode === "private"} onClick={() => { setMode("private"); setLinkOverride(null); }}>
          {privateLabel}
        </button>
        {passphrase ? (
          <button type="button" aria-pressed={mode === "passphrase"} onClick={() => setMode("passphrase")}>
            Passphrase
          </button>
        ) : null}
        <button type="button" aria-pressed={mode === "public"} onClick={() => { setMode("public"); setLinkOverride(null); }}>
          {publicLabel}
        </button>
      </div>
      <p className="bb-share-note">
        {mode === "private"
          ? "Encrypted in your browser. The key travels inside the link and never reaches a server."
          : mode === "passphrase"
            ? "Encrypted with the passphrase you type. The passphrase never travels; share it out of band."
            : "Compact link with the view only. Anyone with the link sees the same view."}
      </p>
      {mode === "passphrase" ? (
        <input
          className="bb-share-passphrase"
          aria-label="Passphrase"
          placeholder="Type a passphrase"
          value={pass}
          onChange={(event) => setPass(event.target.value)}
        />
      ) : null}
      {error === null ? null : <p role="alert">{error}</p>}
      <div className="bb-share-row">
        <input readOnly aria-label="Share link" value={shown} />
        <button type="button" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </section>
  );
}

function fullUrl(fragment: string): string {
  if (typeof location === "undefined") return fragment;
  return `${location.origin}${location.pathname}${fragment}`;
}
