import { useEffect, useRef } from "react";

export function PageContainer({ className = "", ...props }) {
  return <div className={`page-container ${className}`.trim()} {...props} />;
}

export function Card({ className = "", ...props }) {
  return <section className={`surface-card ${className}`.trim()} {...props} />;
}

export function Button({ variant = "primary", className = "", ...props }) {
  return <button className={`button button-${variant} ${className}`.trim()} {...props} />;
}

export function Input({ className = "", ...props }) {
  return <input className={`control ${className}`.trim()} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`control ${className}`.trim()} {...props} />;
}

export function Badge({ tone = "default", className = "", ...props }) {
  return <span className={`badge badge-${tone} ${className}`.trim()} {...props} />;
}

export function SectionHeading({ title, description, action }) {
  return <div className="section-heading"><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>{action}</div>;
}

export function EmptyState({ title, children }) {
  return <section className="surface-card empty-state"><h2>{title}</h2>{children}</section>;
}

export function LoadingState({ label = "Loading…" }) {
  return <div className="loading-state" role="status"><span className="skeleton" />{label}</div>;
}

export function Modal({ title, open, onClose, children }) {
  const dialogRef = useRef(null);
  const titleId = useRef(`dialog-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    if (!dialog.open) dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, [open]);

  if (!open) return null;
  return <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId.current}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="surface-card dialog-content">
      <header className="dialog-header"><h2 id={titleId.current}>{title}</h2><Button variant="ghost" type="button" onClick={onClose} aria-label="Close dialog">Close</Button></header>
      {children}
    </section>
  </dialog>;
}
