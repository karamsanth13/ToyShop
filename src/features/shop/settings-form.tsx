"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/types/database";

type Shop = Pick<Database["public"]["Tables"]["shop_details"]["Row"], "name" | "description" | "logo_path" | "address" | "map_location" | "phone" | "whatsapp_number" | "email">;
type SocialLink = Pick<Database["public"]["Tables"]["social_links"]["Row"], "id" | "platform" | "url" | "label" | "sort_order">;
type ShopResponse = { data: { shop: Shop; socialLinks: SocialLink[] } };

const initialShop: Shop = { name: "", description: "", logo_path: null, address: "", map_location: "", phone: "", whatsapp_number: "", email: "" };

export function ShopSettingsForm() {
  const [shop, setShop] = useState<Shop>(initialShop);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/shop", { cache: "no-store" });
    if (!response.ok) throw new Error("Shop settings could not be loaded.");
    const result = await response.json() as ShopResponse;
    setShop(result.data.shop ?? initialShop);
    setLinks(result.data.socialLinks ?? []);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/shop", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Shop settings could not be loaded.");
      const result = await response.json() as ShopResponse;
      if (active) { setShop(result.data.shop ?? initialShop); setLinks(result.data.socialLinks ?? []); }
    }).catch(() => { if (active) setStatus("Could not load shop settings. Check the Supabase connection."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setStatus("");
    const response = await fetch("/api/admin/shop", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: shop.name || null, description: shop.description || null, address: shop.address || null,
        mapLocation: shop.map_location || null, phone: shop.phone || null,
        whatsappNumber: shop.whatsapp_number || null, email: shop.email || null,
      }),
    });
    setBusy(false);
    setStatus(response.ok ? "Shop details saved." : "Could not save shop details. Check the fields and try again.");
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    if (!(["image/png", "image/jpeg", "image/webp"] as string[]).includes(file.type) || file.size > 5 * 1024 * 1024) {
      setStatus("Choose a PNG, JPEG or WebP image under 5 MB."); return;
    }
    setBusy(true); setStatus("");
    try {
      const client = createClient();
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      const path = `logo/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage.from("shop-assets").upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const response = await fetch("/api/admin/shop", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ logoPath: path }) });
      if (!response.ok) throw new Error("Could not save logo reference.");
      setShop((current) => ({ ...current, logo_path: path }));
      setStatus("Shop logo updated.");
    } catch {
      setStatus("Could not upload the logo. Check your connection and try again.");
    } finally { setBusy(false); }
  }

  async function removeLogo() {
    if (!window.confirm("Remove the current shop logo?")) return;
    const response = await fetch("/api/admin/shop", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ logoPath: null }) });
    if (response.ok) { setShop((current) => ({ ...current, logo_path: null })); setStatus("Shop logo removed."); }
    else setStatus("Could not remove the shop logo.");
  }

  async function addSocial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/admin/social-links", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform: form.get("platform"), url: form.get("url"), label: form.get("label") || null }),
    });
    if (response.ok) { await load(); formElement.reset(); setStatus("Social link added."); }
    else setStatus("Could not add that link. Use a valid HTTPS URL.");
    setBusy(false);
  }

  async function removeSocial(id: string) {
    if (!window.confirm("Remove this social link?")) return;
    const response = await fetch(`/api/admin/social-links/${id}`, { method: "DELETE" });
    if (response.ok) { setLinks((current) => current.filter((link) => link.id !== id)); setStatus("Social link removed."); }
    else setStatus("Could not remove that social link.");
  }

  async function editSocial(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); setBusy(true); setStatus("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/social-links/${id}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform: form.get("platform"), url: form.get("url"), label: form.get("label") || null }),
    });
    if (response.ok) { await load(); setStatus("Social link updated."); }
    else setStatus("Could not update that link. Use a valid HTTPS URL.");
    setBusy(false);
  }

  if (loading) return <p role="status">Loading shop settings…</p>;
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <Card style={{ padding: "1.5rem" }}>
        <h2>Public shop details</h2>
        <form onSubmit={save} className="settings-form">
          <label htmlFor="shop-name">Shop name</label><Input id="shop-name" maxLength={160} value={shop.name ?? ""} onChange={(e) => setShop({ ...shop, name: e.target.value })} />
          <label htmlFor="shop-description">Description</label><Textarea id="shop-description" maxLength={2000} rows={4} value={shop.description ?? ""} onChange={(e) => setShop({ ...shop, description: e.target.value })} />
          <label htmlFor="shop-logo">Logo (PNG, JPEG or WebP; max 5 MB)</label><Input id="shop-logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => uploadLogo(e.target.files?.[0])} />
          {shop.logo_path && process.env.NEXT_PUBLIC_SUPABASE_URL ? <div className="shop-logo-preview"><Image src={`${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/shop-assets/${shop.logo_path}`} alt="Current shop logo" width={80} height={80} unoptimized /><Button type="button" variant="secondary" onClick={removeLogo}>Remove logo</Button></div> : null}
          <label htmlFor="shop-address">Address</label><Input id="shop-address" maxLength={500} value={shop.address ?? ""} onChange={(e) => setShop({ ...shop, address: e.target.value })} />
          <label htmlFor="shop-map">Map location or place name</label><Input id="shop-map" maxLength={2048} value={shop.map_location ?? ""} onChange={(e) => setShop({ ...shop, map_location: e.target.value })} />
          <label htmlFor="shop-phone">Call phone</label><Input id="shop-phone" type="tel" maxLength={40} value={shop.phone ?? ""} onChange={(e) => setShop({ ...shop, phone: e.target.value })} />
          <label htmlFor="shop-whatsapp">WhatsApp number</label><Input id="shop-whatsapp" type="tel" maxLength={40} value={shop.whatsapp_number ?? ""} onChange={(e) => setShop({ ...shop, whatsapp_number: e.target.value })} />
          <label htmlFor="shop-email">Email</label><Input id="shop-email" type="email" maxLength={254} value={shop.email ?? ""} onChange={(e) => setShop({ ...shop, email: e.target.value })} />
          <Button disabled={busy}>{busy ? "Saving…" : "Save shop details"}</Button>
        </form>
      </Card>
      <Card style={{ padding: "1.5rem" }}>
        <h2>Social links</h2>
        {links.length ? <ul className="admin-social-list">{links.map((link) => <li key={link.id}>
          <form onSubmit={(event) => editSocial(event, link.id)} className="social-edit-form">
            <label className="sr-only" htmlFor={`platform-${link.id}`}>Platform</label><select className="control" id={`platform-${link.id}`} name="platform" defaultValue={link.platform}><option>Instagram</option><option>Facebook</option><option>YouTube</option><option>TikTok</option><option>Other</option></select>
            <label className="sr-only" htmlFor={`url-${link.id}`}>HTTPS URL</label><Input id={`url-${link.id}`} name="url" type="url" required defaultValue={link.url} />
            <label className="sr-only" htmlFor={`label-${link.id}`}>Display label</label><Input id={`label-${link.id}`} name="label" maxLength={80} defaultValue={link.label ?? ""} />
            <Button type="submit" variant="secondary" disabled={busy}>Save</Button><Button type="button" variant="ghost" onClick={() => removeSocial(link.id)}>Remove</Button>
          </form>
        </li>)}</ul> : <p>No social links have been added.</p>}
        <form onSubmit={addSocial} className="settings-form">
          <label htmlFor="social-platform">Platform</label><select className="control" id="social-platform" name="platform"><option>Instagram</option><option>Facebook</option><option>YouTube</option><option>TikTok</option><option>Other</option></select>
          <label htmlFor="social-url">HTTPS URL</label><Input id="social-url" name="url" type="url" required placeholder="https://…" />
          <label htmlFor="social-label">Display label (optional)</label><Input id="social-label" name="label" maxLength={80} />
          <Button type="submit" disabled={busy}>Add social link</Button>
        </form>
      </Card>
      {status ? <p role="status" aria-live="polite">{status}</p> : null}
    </div>
  );
}
