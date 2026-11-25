import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

const control = "min-h-11 rounded-xl border border-line bg-surface px-4 text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60";
export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx("min-h-11 rounded-xl bg-coral px-5 font-bold text-ink transition hover:brightness-95 disabled:opacity-50", className)} {...props} />;
}
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={clsx(control, className)} {...props} />; }
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={clsx(control, "min-h-28 py-3", className)} {...props} />; }
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={clsx(control, className)} {...props} />; }
export function Card({ children, className }: { children: ReactNode; className?: string }) { return <div className={clsx("rounded-2xl border border-line bg-surface", className)}>{children}</div>; }
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "danger" | "accent" }) {
  const tones = { neutral: "bg-page text-ink", success: "bg-mint/20 text-success", danger: "bg-danger/10 text-danger", accent: "bg-yellow/30 text-ink" };
  return <span className={clsx("inline-flex min-h-7 items-center rounded-full px-3 text-xs font-bold", tones[tone])}>{children}</span>;
}
export function Skeleton({ className }: { className?: string }) { return <div aria-hidden="true" className={clsx("animate-pulse rounded-xl bg-line", className)} />; }
export function EmptyState({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center"><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-muted">{children}</p></div>; }
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) { return <div className={clsx("mx-auto w-full max-w-[var(--container)] px-[var(--gutter)]", className)}>{children}</div>; }
export function SectionHeading({ title, description }: { title: string; description?: string }) { return <div className="mb-5"><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>{description && <p className="mt-1 text-muted">{description}</p>}</div>; }
export function Dialog({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-2xl bg-surface p-6 text-ink"><h2 className="text-xl font-bold">{title}</h2><div className="mt-4">{children}</div><Button className="mt-6" onClick={onClose}>Close</Button></section></div>;
}
