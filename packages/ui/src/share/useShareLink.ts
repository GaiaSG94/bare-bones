import { useEffect, useState } from "react";
import type { SharePayload } from "@bare-bones/core";
import { encodeLink, readFragment } from "@bare-bones/core";
import type { ShareMode } from "@bare-bones/core";

export interface UseShareLinkResult {
  readonly link: string;
  readonly error: string | null;
}

/**
 * Generates the current share link. The hash is the single source of
 * truth for sharing; nothing is stored anywhere else.
 */
export function useShareLink(
  payload: SharePayload,
  mode: ShareMode,
): UseShareLinkResult {
  const [state, setState] = useState<UseShareLinkResult>({ link: "", error: null });

  useEffect(() => {
    let cancelled = false;
    encodeLink(payload, mode)
      .then((token) => {
        if (!cancelled) setState({ link: token, error: null });
      })
      .catch(() => {
        if (!cancelled) setState({ link: "", error: "The link could not be built." });
      });
    return () => {
      cancelled = true;
    };
  }, [payload, mode]);

  return state;
}

export function useHashToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof location === "undefined") return;
    setToken(readFragment(location.hash));
    const onHashChange = () => setToken(readFragment(location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return token;
}
