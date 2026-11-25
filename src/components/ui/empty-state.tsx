import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="surface-card" style={{ padding: "2rem", textAlign: "center" }}>
      <h2>{title}</h2>
      {children ? <div style={{ color: "var(--text-muted)" }}>{children}</div> : null}
    </section>
  );
}
