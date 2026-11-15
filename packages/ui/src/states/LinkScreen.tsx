import { LinkFallback, PassphrasePrompt } from "./LinkStates.js";

export interface LinkScreenProps {
  readonly status: "invalid" | "locked";
  readonly token: string;
  readonly error: string | null;
  readonly backHref: string;
  readonly onUnlock: (passphrase: string) => void;
  readonly onEmpty: () => void;
}

/** State C: opened from a shared link that cannot be trusted (yet). */
export function LinkScreen({ status, token, error, backHref, onUnlock, onEmpty }: LinkScreenProps) {
  return (
    <div className="bb-screen">
      <div className="bb-screen-bar">
        <a className="bb-screen-back" href={backHref}>← Bare Bones</a>
        <span className="bb-screen-title">Opened from a shared link</span>
        <span className="bb-screen-spacer" />
        <span className="bb-cap">Nothing was loaded</span>
      </div>
      <div className="bb-screen-body bb-link-body">
        {status === "locked" ? (
          <PassphrasePrompt error={error} onSubmit={onUnlock} />
        ) : (
          <LinkFallback url={token} onEmpty={onEmpty} />
        )}
      </div>
    </div>
  );
}
