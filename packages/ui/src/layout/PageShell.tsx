import type { ReactNode } from "react";

export interface PageShellProps {
  readonly backHref?: string | undefined;
  readonly backLabel?: string | undefined;
  readonly title: string;
  readonly sidebar?: ReactNode | undefined;
  readonly side?: ReactNode | undefined;
  readonly children: ReactNode;
}

/**
 * Page frame: optional back link, sidebar, main column and optional right
 * column (used by the two-column designs).
 */
export function PageShell({
  backHref,
  backLabel = "← Bare Bones",
  title,
  sidebar,
  side,
  children,
}: PageShellProps) {
  const hasSide = side !== undefined;
  return (
    <div className={hasSide ? "bb-page bb-page-split" : "bb-page"}>
      {backHref === undefined ? null : (
        <a className="bb-back" href={backHref}>
          {backLabel}
        </a>
      )}
      <div className="bb-page-body">
        {sidebar === undefined ? null : <aside className="bb-page-side">{sidebar}</aside>}
        <main className="bb-page-main">
          <h1>{title}</h1>
          {children}
        </main>
        {side === undefined ? null : <aside className="bb-page-rail">{side}</aside>}
      </div>
    </div>
  );
}
