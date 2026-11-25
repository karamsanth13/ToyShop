"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Copy, MessageCircle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type ShopContact = { phone: string | null; whatsapp_number: string | null };
const DISMISSED_KEY = "toyshop-contact-greeting-dismissed";

export function ContactAssistant() {
  const pathname = usePathname();
  const [contact, setContact] = useState<ShopContact>({ phone: null, whatsapp_number: null });
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const greetingFrame = window.requestAnimationFrame(() => {
      try { setGreetingVisible(localStorage.getItem(DISMISSED_KEY) !== "yes"); } catch { /* Keep the greeting for this visit. */ }
    });
    fetch("/api/shop").then((response) => response.ok ? response.json() : null)
      .then((result) => { if (result?.data?.shop) setContact({ phone: result.data.shop.phone, whatsapp_number: result.data.shop.whatsapp_number }); })
      .catch(() => {});
    const footer = document.querySelector(".shop-footer");
    if (!footer || !("IntersectionObserver" in window)) return () => window.cancelAnimationFrame(greetingFrame);
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(footer);
    return () => { observer.disconnect(); window.cancelAnimationFrame(greetingFrame); };
  }, []);

  if (pathname.startsWith("/admin") || pathname === "/login") return null;
  const phone = contact.phone?.trim() || "";
  const whatsApp = contact.whatsapp_number?.replace(/\D/g, "") || "";
  const tel = phone.replace(/[^0-9+*#,;]/g, "");
  const waUrl = whatsApp ? `https://wa.me/${whatsApp}?text=${encodeURIComponent("Hello! I'd love to ask about your toys.")}` : null;

  function dismissGreeting() {
    setGreetingVisible(false);
    try { localStorage.setItem(DISMISSED_KEY, "yes"); } catch { /* Dismiss for this visit. */ }
  }

  async function copyPhone() {
    try { await navigator.clipboard.writeText(phone); setStatus("Phone number copied."); }
    catch { setStatus(`Phone number: ${phone}`); }
  }

  return (
    <>
      <div className={`contact-assistant${footerVisible ? " contact-assistant-hidden" : ""}`}>
        {greetingVisible ? <div className="contact-greeting"><span>Need a hand finding your next favorite?</span><button type="button" onClick={dismissGreeting} aria-label="Dismiss greeting"><X size={16} /></button></div> : null}
        <button className={`contact-mascot-button${greetingVisible ? "" : " contact-mascot-button-small"}`} type="button" aria-label="Open contact assistant" onClick={() => setOpen(true)}>
          <Image src="/mascot.svg" alt="" width={greetingVisible ? 64 : 44} height={greetingVisible ? 64 : 44} priority />
        </button>
      </div>
      <Dialog title="How would you like to reach us?" open={open} onClose={() => { setOpen(false); setStatus(""); }}>
        <div className="contact-actions">
          {tel ? <div className="contact-action-row"><a className="button button-primary" href={`tel:${tel}`}><Phone size={18} aria-hidden="true" /> Call {phone}</a><Button type="button" variant="secondary" onClick={copyPhone} aria-label="Copy phone number"><Copy size={18} aria-hidden="true" /></Button></div> : <div><Button type="button" disabled><Phone size={18} aria-hidden="true" /> Call</Button><p className="contact-hint">A call number has not been added yet.</p></div>}
          {waUrl ? <a className="button button-secondary" href={waUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp</a> : <div><Button type="button" disabled><MessageCircle size={18} aria-hidden="true" /> Chat</Button><p className="contact-hint">A WhatsApp number has not been added yet.</p></div>}
        </div>
        {status ? <p role="status" aria-live="polite">{status}</p> : null}
        <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Close</Button>
      </Dialog>
    </>
  );
}
