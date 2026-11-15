import { useState } from "react";

export interface LinkFallbackProps {
  readonly url: string;
  readonly mode?: string;
  readonly onNewLink?: (() => void) | undefined;
  readonly onEmpty?: (() => void) | undefined;
}

/** State C, tampered public link: fallback message, nothing replaced. */
export function LinkFallback({ url, mode = "Public link", onNewLink, onEmpty }: LinkFallbackProps) {
  return (
    <section className="bb-link-alert" aria-label="Broken shared link">
      <span className="bb-pill no">{mode}</span>
      <h3>This link was changed or cut short.</h3>
      <p>
        Part of it is missing, so we can&apos;t rebuild the view. Your own data is safe:
        nothing was loaded or replaced.
      </p>
      <code className="bb-link-url">
        …{typeof location === "undefined" ? "" : location.pathname}#bb=
        {url.slice(0, 12)}<u>…</u>
      </code>
      <div className="bb-link-actions">
        <button type="button" onClick={onNewLink}>Ask for a new link</button>
        <button type="button" onClick={onEmpty}>Open an empty explorer</button>
      </div>
    </section>
  );
}

export interface PassphrasePromptProps {
  readonly error: string | null;
  readonly onSubmit: (passphrase: string) => void;
}

/** State C, private link: passphrase gate, error line when it fails. */
export function PassphrasePrompt({ error, onSubmit }: PassphrasePromptProps) {
  const [value, setValue] = useState("");
  return (
    <section className="bb-link-alert bb-link-dark" aria-label="Private link">
      <span className="bb-pill dark">Private · encrypted</span>
      <h3>Enter the passphrase you were given.</h3>
      <form
        className="bb-passphrase"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(value);
        }}
      >
        <input
          type="password"
          aria-label="Passphrase"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="••••••••••"
        />
        <button type="submit">Unlock</button>
      </form>
      {error === null ? null : (
        <span className="bb-passphrase-error" role="alert">
          {error}
        </span>
      )}
      <p>It is checked in this browser only. We never see it and can&apos;t reset it.</p>
    </section>
  );
}
