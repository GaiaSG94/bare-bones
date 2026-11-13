import type { ReactNode } from "react";

export interface SidebarProps {
  readonly items: readonly { id: string; label: string }[];
  readonly activeId: string;
  readonly onSelect: (id: string) => void;
  readonly notice?: string | undefined;
  readonly footer?: ReactNode | undefined;
}

/** Left navigation of an explorer: views, plus the privacy notice. */
export function Sidebar({ items, activeId, onSelect, notice, footer }: SidebarProps) {
  return (
    <nav className="bb-sidebar" aria-label="Views">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-current={item.id === activeId ? "page" : undefined}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      {notice === undefined ? null : (
        <p className="bb-sidebar-notice">{notice}</p>
      )}
      {footer}
    </nav>
  );
}
