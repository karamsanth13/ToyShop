import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Copy, Heart, MessageCircle, Moon, Phone, Sun, X, Tag } from "lucide-react";
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
  const { productIds } = useWishlist();
  const [shop, setShop] = useState(null);
  useEffect(() => { api.get("/shop").then(({ data }) => setShop(data.data.shop)).catch(() => setShop(null)); }, []);
  const name = shop?.name?.trim() || "Toy Shop";
  return <header className="shop-header"><PageContainer className="shop-header-inner">
    <Link to="/" className="shop-brand" aria-label={`${name} home`}>
      {shop?.logoUrl ? <img className="shop-logo" src={shop.logoUrl} alt="" /> : <span className="shop-logo-placeholder" aria-hidden="true">TS</span>}
      <span>{name}</span>
    </Link>
    <nav className="shop-nav" aria-label="Main navigation">
      <Link to="/offers" aria-label="View current offers"><Tag size={20} aria-hidden="true" /><span className="sr-only">Offers</span></Link>
      <Link to="/wishlist" aria-label="Open wishlist"><Heart size={20} aria-hidden="true" /><span className="sr-only">Wishlist</span></Link>
      <ThemeToggle />
      {user ? <Link to="/admin" className="admin-nav-link">Admin</Link> : null}
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
    <div className="shop-footer-bottom">Visit us in person to find your next favorite toy.</div>
  </PageContainer></footer>;
}

export function ContactAssistant() {
  const location = useLocation();
  const [contact, setContact] = useState({ phone: null, whatsappNumber: null });
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try { setGreetingVisible(localStorage.getItem("toyshop-contact-greeting-dismissed") !== "yes"); } catch { /* Keep the greeting. */ }
    api.get("/shop").then(({ data }) => setContact({ phone: data.data.shop?.phone, whatsappNumber: data.data.shop?.whatsappNumber })).catch(() => {});
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

  return <>
    <div className={`contact-assistant${footerVisible ? " contact-assistant-hidden" : ""}`}>
      {greetingVisible ? <div className="contact-greeting"><span>Need a hand finding your next favorite?</span><button type="button" onClick={dismissGreeting} aria-label="Dismiss greeting"><X size={16} /></button></div> : null}
      <button className={`contact-mascot-button${greetingVisible ? "" : " contact-mascot-button-small"}`} type="button" aria-label="Open contact assistant" onClick={() => setOpen(true)}>
        <img src="/mascot.svg" alt="" width={greetingVisible ? 64 : 44} height={greetingVisible ? 64 : 44} />
      </button>
    </div>
    <Modal title="How would you like to reach us?" open={open} onClose={() => { setOpen(false); setStatus(""); }}>
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
