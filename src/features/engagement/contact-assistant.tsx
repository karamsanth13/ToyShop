"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Copy, MapPin, MessageCircle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type ShopContact = {
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  map_location: string | null;
  opening_hours: string | null;
};
type Message = { question: string; answer: string };
const DISMISSED_KEY = "toyshop-contact-greeting-dismissed";
const emptyContact: ShopContact = { phone: null, whatsapp_number: null, email: null, address: null, map_location: null, opening_hours: null };

export function ContactAssistant() {
  const pathname = usePathname();
  const [contact, setContact] = useState<ShopContact>(emptyContact);
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const greetingFrame = window.requestAnimationFrame(() => {
      try { setGreetingVisible(localStorage.getItem(DISMISSED_KEY) !== "yes"); } catch { /* Keep the greeting for this visit. */ }
    });
    fetch("/api/shop").then((response) => response.ok ? response.json() : null)
      .then((result) => { if (result?.data?.shop) setContact({ ...emptyContact, ...result.data.shop }); })
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
  const mapQuery = contact.map_location?.trim() || contact.address?.trim();
  const mapUrl = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : null;

  function dismissGreeting() {
    setGreetingVisible(false);
    try { localStorage.setItem(DISMISSED_KEY, "yes"); } catch { /* Dismiss for this visit. */ }
  }

  function getAnswer(question: string) {
    const normalized = question.toLowerCase();
    if (normalized.includes("where") || normalized.includes("location") || normalized.includes("address")) {
      return contact.address ? `You can find us at ${contact.address}.` : "Our shop address has not been added yet.";
    }
    if (normalized.includes("hour") || normalized.includes("open") || normalized.includes("time")) {
      return contact.opening_hours ? `Our opening hours are:\n${contact.opening_hours}` : "Opening hours have not been added yet. Please contact the shop directly.";
    }
    if (normalized.includes("product") || normalized.includes("toy") || normalized.includes("arrival")) {
      return "Explore the toy catalogue to see current products and availability. The shop team can help with a particular item.";
    }
    if (normalized.includes("contact") || normalized.includes("phone") || normalized.includes("whatsapp") || normalized.includes("email")) {
      const methods = [phone && `Call us at ${phone}`, contact.email && `Email us at ${contact.email}`, waUrl && "Message us on WhatsApp"].filter(Boolean);
      return methods.length ? methods.join(" · ") : "Contact details have not been added yet.";
    }
    return "Thanks for reaching out. Choose a topic below or use one of the contact options to speak with the shop team.";
  }

  function ask(question: string) {
    setMessages((current) => [...current, { question, answer: getAnswer(question) }]);
    setStatus("");
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const question = String(data.get("question") ?? "").trim();
    if (!question) return;
    ask(question);
    event.currentTarget.reset();
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
      <Dialog title="Toy Shop helper" open={open} onClose={() => { setOpen(false); setStatus(""); }}>
        <p className="contact-hint">I can help with shop information and point you to the toy catalogue.</p>
        <div className="assistant-messages" aria-live="polite">
          {messages.map((message, index) => <article className="assistant-message" key={`${index}-${message.question}`}><p><strong>You:</strong> {message.question}</p><p><strong>Shop helper:</strong> {message.answer}</p></article>)}
        </div>
        <div className="assistant-topics" aria-label="Common questions">
          {[
            ["Where is the shop?", MapPin], ["What are your opening hours?", null], ["Show me products", null], ["How can I contact you?", MessageCircle],
          ].map(([question, Icon]) => <Button key={String(question)} type="button" variant="secondary" onClick={() => ask(String(question))}>{Icon ? <Icon size={16} aria-hidden="true" /> : null}{String(question)}</Button>)}
        </div>
        <form className="assistant-question-form" onSubmit={submitQuestion}>
          <label className="sr-only" htmlFor="assistant-question">Ask a question</label>
          <input className="control" id="assistant-question" name="question" maxLength={240} placeholder="Ask about the shop…" />
          <Button type="submit">Ask</Button>
        </form>
        <div className="contact-actions">
          {tel ? <div className="contact-action-row"><a className="button button-primary" href={`tel:${tel}`}><Phone size={18} aria-hidden="true" /> Call {phone}</a><Button type="button" variant="secondary" onClick={copyPhone} aria-label="Copy phone number"><Copy size={18} aria-hidden="true" /></Button></div> : null}
          {waUrl ? <a className="button button-secondary" href={waUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp</a> : null}
          {contact.email ? <a className="button button-secondary" href={`mailto:${contact.email}`}>Email the shop</a> : null}
          {mapUrl ? <a className="button button-secondary" href={mapUrl} target="_blank" rel="noreferrer">Open shop location</a> : null}
          {!tel && !waUrl && !contact.email && !mapUrl ? <p className="contact-hint">Shop contact details have not been configured yet.</p> : null}
          <Link className="button button-ghost" href="/">Browse toys</Link>
        </div>
        {status ? <p role="status" aria-live="polite">{status}</p> : null}
        <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Close</Button>
      </Dialog>
    </>
  );
}
