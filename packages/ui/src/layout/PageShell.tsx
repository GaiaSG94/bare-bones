import type { ReactNode } from "react";

export interface PageShellProps {
  readonly backHref?: string | undefined;
  readonly backLabel?: string | undefined;
  readonly title: string;
  readonly sidebar?: ReactNode | undefined;
  readonly children: ReactNode;
}

/** Page frame: optional back link, sidebar and main column. */
export function PageShell({
  backHref,
  backLabel = "← Bare Bones",
  title,
  sidebar,
  children,
}: PageShellProps) {
  return (
    <div className="bb-page">
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
      </div>
    </div>
  );
}
