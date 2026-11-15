import { decodeLink, decodePrivateLink, decodePrivateLinkWithPassphrase, decodePublicLink } from "@bare-bones/core";
import type { SharePayload } from "@bare-bones/core";
import { useCallback, useEffect, useState } from "react";
import { readFragment } from "@bare-bones/core";

/** Decode a share token, handling the passphrase variant (`v1.k.`). */
export async function decodeShareToken(token: string, passphrase?: string): Promise<SharePayload> {
  if (token.includes(".k.")) {
    if (passphrase === undefined) {
      throw new Error("passphrase-required");
    }
    return (await decodePrivateLinkWithPassphrase(token, passphrase)).payload;
  }
  if (token.includes(".s.")) {
    return (await decodePrivateLink(token)).payload;
  }
  return (await decodePublicLink(token)).payload;
}

export interface IncomingLinkState {
  readonly status: "none" | "ready" | "invalid" | "locked";
  readonly payload: SharePayload | null;
  readonly token: string;
  /** True when the token is present but nothing was loaded or replaced. */
  readonly blocked: boolean;
  readonly error: string | null;
  readonly unlock: (passphrase: string) => void;
  readonly dismiss: () => void;
}

const NONE: IncomingLinkState = {
  status: "none",
  payload: null,
  token: "",
  blocked: false,
  error: null,
  unlock: () => {},
  dismiss: () => {},
};

/**
 * Reads the `#bb=` fragment: ready, invalid (fallback, nothing replaced),
 * or locked (passphrase prompt). Existing data is never touched on error.
 */
export function useIncomingLink(): IncomingLinkState {
  const [state, setState] = useState<IncomingLinkState>(NONE);

  useEffect(() => {
    const apply = async (): Promise<void> => {
      const token = readFragment(typeof location === "undefined" ? "" : location.hash);
      if (token === null || token === "") {
        setState(NONE);
        return;
      }
      if (token.includes(".k.")) {
        setState({ ...NONE, status: "locked", token, blocked: true });
        return;
      }
      try {
        const payload = await decodeShareToken(token);
        setState({ ...NONE, status: "ready", token, payload });
      } catch (error) {
        setState({
          ...NONE,
          status: "invalid",
          token,
          blocked: true,
          error: error instanceof Error ? error.message : "This link could not be read.",
        });
      }
    };
    void apply();
    const onHashChange = (): void => {
      void apply();
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const unlock = useCallback((passphrase: string): void => {
    const token = readFragment(typeof location === "undefined" ? "" : location.hash) ?? "";
    void (async () => {
      try {
        const payload = await decodeShareToken(token, passphrase);
        setState({ ...NONE, status: "ready", token, payload });
      } catch {
        setState((current) => ({
          ...current,
          status: "locked",
          blocked: true,
          error: "That passphrase doesn't open this link. Check it with the sender.",
        }));
      }
    })();
  }, []);

  const dismiss = useCallback(() => {
    setState(NONE);
  }, []);

  return { ...state, unlock, dismiss };
}
