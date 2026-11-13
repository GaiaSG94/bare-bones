import { useState } from "react";
import type { ShareMode } from "@bare-bones/core";
import { useShareLink } from "./useShareLink.js";
import type { SharePayload } from "@bare-bones/core";

export interface ShareCardProps {
  readonly title: string;
  readonly payload: SharePayload;
  readonly defaultMode?: ShareMode | undefined;
  readonly publicLabel?: string | undefined | undefined;
  readonly privateLabel?: string | undefined | undefined;
}

/**
 * Share panel: public (compact link) or private (encrypted snapshot).
 * The key of a private link travels in the fragment and never touches a
 * server, so the card says so explicitly.
 */
export function ShareCard({
  title,
  payload,
  defaultMode = "private",
  publicLabel = "Public link",
  privateLabel = "Private link",
}: ShareCardProps) {
  const [mode, setMode] = useState<ShareMode>(defaultMode);
  const [copied, setCopied] = useState(false);
  const { link, error } = useShareLink(payload, mode);

  const copy = async () => {
    if (link === "") return;
    try {
      await navigator.clipboard.writeText(fullUrl(link));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="bb-share" aria-label={title}>
      <h3>{title}</h3>
      <div className="bb-share-modes" role="group" aria-label="Share mode">
        <button
          type="button"
          aria-pressed={mode === "private"}
          onClick={() => setMode("private")}
        >
          {privateLabel}
        </button>
        <button
          type="button"
          aria-pressed={mode === "public"}
          onClick={() => setMode("public")}
        >
          {publicLabel}
        </button>
      </div>
      <p className="bb-share-note">
        {mode === "private"
          ? "Encrypted in your browser. The key travels inside the link and never reaches a server."
          : "Compact link with the view only. Anyone with the link sees the same view."}
      </p>
      {error === null ? null : <p role="alert">{error}</p>}
      <div className="bb-share-row">
        <input readOnly aria-label="Share link" value={link} />
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
