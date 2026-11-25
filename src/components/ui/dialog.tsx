"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export function Dialog({ title, open, onClose, children }: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, [open]);

  if (!open) return null;
  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      style={{ width: "min(calc(100% - 2rem), 32rem)", maxHeight: "min(85dvh, 48rem)", padding: 0, border: 0, background: "transparent", color: "var(--text)" }}
    >
      <section aria-labelledby={titleId} className="surface-card" style={{ padding: "1.5rem" }}>
        <header style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "1rem" }}>
          <h2 id={titleId} style={{ marginTop: 0 }}>{title}</h2>
          <button className="button button-ghost" type="button" onClick={onClose} aria-label="Close dialog">Close</button>
        </header>
        {children}
      </section>
    </dialog>
  );
}
