"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Database } from "@/types/database";

type AdminUser = Pick<Database["public"]["Tables"]["admin_profiles"]["Row"], "id" | "full_name" | "email" | "role" | "created_at">;

export function AdminAccounts() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/admins", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error("Could not load admin accounts.");
    setAdmins(result.data);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admins", { cache: "no-store" }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error("Could not load admin accounts.");
      if (active) setAdmins(result.data);
    }).catch(() => { if (active) setStatus("Could not load admin accounts."); });
    return () => { active = false; };
  }, []);

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/admins", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fullName: data.get("fullName"), email: data.get("email") }) });
    if (response.ok) { form.reset(); await load(); setStatus("Admin invitation sent."); }
    else setStatus("Could not send the invitation. Check email provider configuration.");
    setBusy(false);
  }

  async function remove(admin: AdminUser) {
    if (!window.confirm(`Remove admin access for ${admin.full_name}?`)) return;
    const response = await fetch(`/api/admins/${admin.id}`, { method: "DELETE" });
    if (response.ok) { setAdmins((current) => current.filter((item) => item.id !== admin.id)); setStatus("Admin access removed."); }
    else setStatus("Could not remove that admin account.");
  }

  return <div style={{ display: "grid", gap: "1.5rem" }}>
    <Card style={{ padding: "1.5rem" }}>
      <h2>Invite an Admin</h2>
      <p>Invitations use the configured Supabase email provider.</p>
      <form onSubmit={invite} className="settings-form">
        <label htmlFor="admin-full-name">Name</label><Input id="admin-full-name" name="fullName" required maxLength={120} />
        <label htmlFor="admin-email">Email</label><Input id="admin-email" name="email" type="email" required maxLength={254} />
        <Button disabled={busy}>{busy ? "Sending…" : "Send invitation"}</Button>
      </form>
    </Card>
    <Card style={{ padding: "1.5rem" }}>
      <h2>Admin accounts</h2>
      {admins.length ? <ul className="admin-social-list">{admins.map((admin) => <li key={admin.id}><span>{admin.full_name} · {admin.email} · {admin.role}</span>{admin.role === "Admin" ? <Button type="button" variant="secondary" onClick={() => remove(admin)}>Remove</Button> : <span>Protected</span>}</li>)}</ul> : <p>No admin profiles are available.</p>}
    </Card>
    {status ? <p role="status" aria-live="polite">{status}</p> : null}
  </div>;
}
