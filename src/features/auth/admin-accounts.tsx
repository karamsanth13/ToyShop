"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Database } from "@/types/database";

type AdminUser = Pick<Database["public"]["Tables"]["admin_profiles"]["Row"], "id" | "full_name" | "email" | "role" | "is_active" | "created_at">;

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
    if (!window.confirm(`Deactivate ${admin.full_name}'s admin access? They can be reactivated later.`)) return;
    const response = await fetch(`/api/admins/${admin.id}`, { method: "DELETE" });
    if (response.ok) { setAdmins((current) => current.map((item) => item.id === admin.id ? { ...item, is_active: false } : item)); setStatus("Admin access deactivated."); }
    else setStatus("Could not deactivate that admin account.");
  }

  async function update(admin: AdminUser, values: { fullName?: string; isActive?: boolean }) {
    setBusy(true); setStatus("");
    const response = await fetch(`/api/admins/${admin.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(values),
    });
    if (response.ok) {
      const result = await response.json();
      setAdmins((current) => current.map((item) => item.id === admin.id ? result.data as AdminUser : item));
      setStatus(values.isActive === true ? "Admin access reactivated." : values.isActive === false ? "Admin access deactivated." : "Admin account updated.");
    } else setStatus("Could not update that admin account.");
    setBusy(false);
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
      {admins.length ? <ul className="admin-social-list">{admins.map((admin) => <li key={admin.id}>
        <div className="admin-account-details">
          <span>{admin.email} · {admin.role} · {admin.is_active ? "Active" : "Deactivated"}</span>
          {admin.role === "Admin" ? <form className="admin-name-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); update(admin, { fullName: String(data.get("fullName") ?? "") }); }}>
            <Input aria-label={`Name for ${admin.email}`} name="fullName" required maxLength={120} defaultValue={admin.full_name} />
            <Button type="submit" variant="secondary" disabled={busy}>Save name</Button>
          </form> : <strong>{admin.full_name} · Protected account</strong>}
        </div>
        {admin.role === "Admin" ? admin.is_active
          ? <Button type="button" variant="secondary" disabled={busy} onClick={() => remove(admin)}>Deactivate</Button>
          : <Button type="button" variant="secondary" disabled={busy} onClick={() => update(admin, { isActive: true })}>Reactivate</Button>
          : null}
      </li>)}</ul> : <p>No admin profiles are available.</p>}
    </Card>
    {status ? <p role="status" aria-live="polite">{status}</p> : null}
  </div>;
}
