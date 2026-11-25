"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const apiMessage = typeof result === "object" && result !== null && "error" in result
          ? (result as { error?: { message?: string } }).error?.message : undefined;
        setMessage(apiMessage || "Could not sign in. Check your details and try again.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setMessage("Login is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ paddingBlock: "3rem" }}>
      <PageContainer>
        <Card style={{ maxWidth: "28rem", marginInline: "auto", padding: "1.5rem" }}>
          <SectionHeading title="Admin sign in" description="Sign in with your shop admin account." />
          <form onSubmit={submit} style={{ display: "grid", gap: "1rem" }}>
            <label htmlFor="email">Email</label>
            <Input id="email" name="email" type="email" autoComplete="username" required maxLength={254} />
            <label htmlFor="password">Password</label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} />
            {message ? <p role="alert" style={{ color: "var(--danger)" }}>{message}</p> : null}
            <Button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
          </form>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Admin access is invitation-only. There is no public sign-up.</p>
        </Card>
      </PageContainer>
    </main>
  );
}
