import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Copy, Heart, MessageCircle, Moon, Phone, Sun, X, Tag, Menu, UserRound } from "lucide-react";
import { api } from "@/api/http.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useWishlist } from "@/context/WishlistContext.jsx";
import { Button, Modal, PageContainer } from "@/components/ui.jsx";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <Button variant="ghost" type="button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} onClick={toggleTheme}>
    {theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
  </Button>;
}

export function ShopHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const [shop, setShop] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { api.get("/shop").then(({ data }) => setShop(data.data.shop)).catch(() => setShop(null)); }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  const name = shop?.name?.trim() || "Toy Shop";
  return <header className="shop-header"><PageContainer className="shop-header-inner">
    <Link to="/" className="shop-brand" aria-label={`${name} home`}>
      {shop?.logoUrl ? <img className="shop-logo" src={shop.logoUrl} alt="" /> : <span className="shop-logo-placeholder" aria-hidden="true">TS</span>}
      <span>{name}</span>
    </Link>
    <Button className="shop-mobile-toggle" variant="ghost" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="shop-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</Button>
    <nav id="shop-navigation" className={`shop-nav${menuOpen ? " shop-nav-open" : ""}`} aria-label="Main navigation">
      <Link to="/" aria-label="Browse toys"><span className="shop-nav-icon"><Heart size={18} aria-hidden="true" /></span><span>Shop toys</span></Link>
      <Link to="/offers"><span className="shop-nav-icon"><Tag size={18} aria-hidden="true" /></span><span>Offers</span></Link>
      <Link to="/wishlist"><span className="shop-nav-icon"><Heart size={18} aria-hidden="true" /></span><span>Wishlist</span></Link>
      <ThemeToggle />
      {user ? <Link to="/admin" className="admin-nav-link"><span className="shop-nav-icon"><UserRound size={18} aria-hidden="true" /></span><span>Dashboard</span></Link> : <Link to="/login" className="admin-nav-link"><span className="shop-nav-icon"><UserRound size={18} aria-hidden="true" /></span><span>Admin login</span></Link>}
    </nav>
  </PageContainer></header>;
}

export function ShopFooter() {
  const [data, setData] = useState({ shop: null, socialLinks: [] });
  useEffect(() => { api.get("/shop").then(({ data: result }) => setData(result.data)).catch(() => {}); }, []);
  const { shop, socialLinks } = data;
  const mapQuery = shop?.mapLocation?.trim() || shop?.address?.trim();
  return <footer className="shop-footer"><PageContainer>
    <div className="shop-footer-grid">
      <section><h2>{shop?.name?.trim() || "Toy Shop"}</h2><p>{shop?.description || "Find a little something for every kind of play."}</p></section>
      <section><h3>Contact</h3>
        {shop?.address ? <p>{shop.address}</p> : null}
        {shop?.openingHours ? <p><strong>Opening hours</strong><br />{shop.openingHours}</p> : null}
        {shop?.phone ? <p><a href={`tel:${shop.phone}`}>{shop.phone}</a></p> : null}
        {shop?.email ? <p><a href={`mailto:${shop.email}`}>{shop.email}</a></p> : null}
        {!shop?.address && !shop?.phone && !shop?.email ? <p>Shop contact details will appear here when available.</p> : null}
      </section>
      <section><h3>Follow along</h3>{socialLinks.length
        ? <ul className="shop-social-links">{socialLinks.map((link) => <li key={link.id}><a href={link.url} target="_blank" rel="noreferrer">{link.label || link.platform}</a></li>)}</ul>
        : <p>Social links will appear here when available.</p>}</section>
      <section><h3>Find us</h3>{mapQuery
        ? <iframe title="Shop location map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} />
        : <p>Location details have not been added yet.</p>}</section>
    </div>
    <div className="shop-footer-bottom"><span>Visit us in person to find your next favorite toy.</span><Link to="/login">Admin login</Link></div>
  </PageContainer></footer>;
}

export function ContactAssistant() {
  const location = useLocation();
  const [contact, setContact] = useState({});
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    try { setGreetingVisible(localStorage.getItem("toyshop-contact-greeting-dismissed") !== "yes"); } catch { /* Keep the greeting. */ }
    api.get("/shop").then(({ data }) => setContact(data.data.shop || {})).catch(() => {});
  }, []);

  useEffect(() => {
    const footer = document.querySelector(".shop-footer");
    if (!footer || !window.IntersectionObserver) return undefined;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(footer);
    return () => observer.disconnect();
  }, [location.pathname]);

  if (location.pathname.startsWith("/admin") || location.pathname === "/login") return null;
  const phone = contact.phone?.trim() || "";
  const tel = phone.replace(/[^0-9+*#,;]/g, "");
  const whatsapp = contact.whatsappNumber?.replace(/\D/g, "") || "";
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello! I'd love to ask about your toys.")}` : null;

  function dismissGreeting() {
    setGreetingVisible(false);
    try { localStorage.setItem("toyshop-contact-greeting-dismissed", "yes"); } catch { /* Keep dismissed for this visit. */ }
  }

  async function copyPhone() {
    try { await navigator.clipboard.writeText(phone); setStatus("Phone number copied."); }
    catch { setStatus(`Phone number: ${phone}`); }
  }

  function answerQuestion(value) {
    const text = value.trim().toLowerCase();
    if (!text) return;
    setQuestion(value);
    if (/where|location|address|find you|map/.test(text)) setAnswer(contact.address || contact.mapLocation || "The shop location has not been added yet. Please contact the team for directions.");
    else if (/hour|open|close|time/.test(text)) setAnswer(contact.openingHours || "Opening hours have not been added yet. Please contact the shop before visiting.");
    else if (/stock|available|reserve|book|hold|sold out/.test(text)) setAnswer("Open a toy’s detail page to see its current availability. For an out-of-stock toy, use “Ask about availability” and the shop will follow up. Requests are not purchases.");
    else if (/product|toy|catalog|browse|age|gift/.test(text)) setAnswer("You can browse the full toy collection and filter by category, age, price and availability. Choose “Shop toys” in the menu to get started.");
    else if (/contact|phone|call|email|whatsapp|message/.test(text)) setAnswer([phone && `Phone: ${phone}`, contact.email && `Email: ${contact.email}`, contact.whatsappNumber && "WhatsApp is available below."].filter(Boolean).join(" · ") || "The shop has not added contact details yet.");
    else setAnswer("I can help with the shop location, opening hours, toys and availability, or contact details. Choose a prompt or ask about one of those topics.");
  }

  return <>
    <div className={`contact-assistant${footerVisible ? " contact-assistant-hidden" : ""}`}>
      {greetingVisible ? <div className="contact-greeting"><span>Need a hand finding your next favorite?</span><button type="button" onClick={dismissGreeting} aria-label="Dismiss greeting"><X size={16} /></button></div> : null}
      <button className={`contact-mascot-button${greetingVisible ? "" : " contact-mascot-button-small"}`} type="button" aria-label="Open contact assistant" onClick={() => setOpen(true)}>
        <img src="/mascot.svg" alt="" width={greetingVisible ? 64 : 44} height={greetingVisible ? 64 : 44} />
      </button>
    </div>
    <Modal title="Toy Shop quick answers" open={open} onClose={() => { setOpen(false); setStatus(""); }}>
      <p className="contact-hint">Quick answers use shop details and simple keyword matching. This is a rule-based helper, not an AI chatbot.</p>
      <div className="assistant-prompts" aria-label="Common questions">{["Where is the shop?", "When are you open?", "How do I check a toy?", "How can I contact you?"] .map((prompt) => <button className="assistant-prompt" key={prompt} type="button" onClick={() => answerQuestion(prompt)}>{prompt}</button>)}</div>
      <form className="assistant-question-form" onSubmit={(event) => { event.preventDefault(); answerQuestion(question); }}><label htmlFor="assistant-question">Ask about the shop</label><div><input id="assistant-question" value={question} maxLength="160" onChange={(event) => setQuestion(event.target.value)} placeholder="Try “opening hours”" /><Button type="submit">Ask</Button></div></form>
      {answer && <p className="assistant-answer" role="status" aria-live="polite">{answer}</p>}
      <div className="contact-actions">
        {tel ? <div className="contact-action-row"><a className="button button-primary" href={`tel:${tel}`}><Phone size={18} aria-hidden="true" /> Call {phone}</a><Button variant="secondary" type="button" onClick={copyPhone} aria-label="Copy phone number"><Copy size={18} /></Button></div>
          : <div><Button disabled type="button"><Phone size={18} /> Call</Button><p className="contact-hint">A call number has not been added yet.</p></div>}
        {whatsappUrl ? <a className="button button-secondary" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp</a>
          : <div><Button disabled type="button"><MessageCircle size={18} /> Chat</Button><p className="contact-hint">A WhatsApp number has not been added yet.</p></div>}
      </div>
      {status ? <p role="status" aria-live="polite">{status}</p> : null}
      <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Close</Button>
    </Modal>
  </>;
}

export function ShopShell({ children }) {
  return <><ShopHeader />{children}<ShopFooter /><ContactAssistant /></>;
}
