import type { ReactNode } from "react";

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: "1rem", marginBlock: "1.5rem" }}>
      <div><h2 style={{ marginBottom: "0.25rem" }}>{title}</h2>{description ? <p style={{ margin: 0, color: "var(--text-muted)" }}>{description}</p> : null}</div>
      {action}
    </div>
  );
}
