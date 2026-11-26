import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { ArrowDownRight, Check, Heart, Search, ShieldCheck, Tag } from "lucide-react";
import { api, getApiMessage } from "@/api/http.js";
import { ShopShell } from "@/components/layout.jsx";
import { AdminShell } from "@/components/AdminShell.jsx";
import { Button, Modal, PageContainer, SectionHeading } from "@/components/ui.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { useWishlist } from "@/context/WishlistContext.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { ActivityPage, AdminAccountsPage, CategoriesPage, DashboardPage, EnquiriesPage, OffersPage as AdminOffersPage, PreBookingsPage, ProductsPage, SubscribersPage } from "@/admin/pages.jsx";

function ProductCard({ product, compact = false }) {
  const { has, toggle } = useWishlist();
  return <article className={`product-card${compact ? " product-card-compact" : ""}`}>
    <Link to={`/products/${product.slug}`} className="product-image-wrap">
      {product.images?.[0] ? <img src={product.images[0]} alt={product.name} loading="lazy" /> : <div className="product-image-placeholder">Toy Shop</div>}
      {product.isNew && <span className="product-ribbon">New</span>}
      <span className={`stock-badge ${product.availability === "out_of_stock" ? "out" : ""}`}>{product.availability === "out_of_stock" ? "Out of stock" : "In stock"}</span>
    </Link>
    <div className="product-card-content">
      <p className="product-category">{product.category?.name || "Toy"}{product.ageGroup ? ` · ${product.ageGroup}` : ""}</p>
      <Link to={`/products/${product.slug}`}><h3>{product.name}</h3></Link>
      <div className="product-card-bottom"><span>{product.discountedPrice ? <><del>{product.price}</del> <strong>{product.discountedPrice}</strong></> : product.price}</span><Button variant="ghost" type="button" aria-label={`${has(product.id) ? "Remove" : "Add"} ${product.name} ${has(product.id) ? "from" : "to"} wishlist`} onClick={() => toggle(product.id)}><Heart fill={has(product.id) ? "currentColor" : "none"} size={20} /></Button></div>
    </div>
  </article>;
}

function FeaturedShowcase() {
  const [sections, setSections] = useState({});
  useEffect(() => {
    let active = true;
    const flags = ["isRecommended", "isNew", "isBestSeller"];
    Promise.all(flags.map((flag) => api.get("/catalogue/products", { params: { flag, limit: 4 } }).then(({ data }) => [flag, data.data.products]).catch(() => [flag, []])))
      .then((entries) => { if (active) setSections(Object.fromEntries(entries)); });
    return () => { active = false; };
  }, []);
  const groups = [["isRecommended", "Picked for play", "/recommended"], ["isNew", "New arrivals", "/new"], ["isBestSeller", "Shop favorites", "/best-sellers"]];
  return <div className="featured-showcase">{groups.map(([key, title, path]) => sections[key]?.length ? <section className="featured-section" key={key}><SectionHeading title={title} action={<Link to={path}>Explore all <ArrowDownRight size={16} /></Link>} /><div className="product-grid">{sections[key].map((product) => <ProductCard key={product.id} product={product} />)}</div></section> : null)}</div>;
}

function FeaturedOffers() {
  const [offers, setOffers] = useState([]);
  useEffect(() => { api.get("/catalogue/offers").then(({ data }) => setOffers(data.data.offers)).catch(() => setOffers([])); }, []);
  if (!offers.length) return null;
  const picks = offers.flatMap((offer) => offer.products.slice(0, 2).map(({ product }) => product)).slice(0, 4);
  return <section className="home-offers"><div className="home-offers-heading"><div><p className="eyebrow">A LITTLE EXTRA PLAY</p><h2>Current shop offers</h2><p>Good finds with a little something off. Available in person while the offer lasts.</p></div><Link className="text-link" to="/offers">See all offers <ArrowDownRight size={17} /></Link></div><div className="home-offer-banner">{offers.slice(0, 2).map((offer) => <article key={offer.id}><span>{offer.discountPercent}% off selected toys</span><h3>{offer.title}</h3><p>{offer.description || "A limited-time offer at the Toy Shop."}</p><small>Until {new Date(offer.endsAt).toLocaleDateString()}</small></article>)}</div>{picks.length > 0 && <div className="product-grid">{picks.map((product) => <ProductCard key={product.id} product={product} compact />)}</div>}</section>;
}

function Catalogue({ initial = {} }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ q: "", category: initial.category || "", minPrice: "", maxPrice: "", ageGroup: "", availability: "", sort: "relevance" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { api.get("/catalogue/categories").then(({ data }) => setCategories(data.data.categories)).catch(() => setCategories([])); }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const params = Object.fromEntries(Object.entries({ ...filters, flag: initial.flag, limit: 48 }).filter(([, value]) => value !== "" && value !== undefined));
    api.get("/catalogue/products", { params })
      .then(({ data }) => { if (active) setProducts(data.data.products); })
      .catch((reason) => { if (active) setError(getApiMessage(reason, "We couldn't load the toys. Please try again.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters, initial.flag]);

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const clearFilters = () => setFilters({ q: "", category: "", minPrice: "", maxPrice: "", ageGroup: "", availability: "", sort: "relevance" });
  const isHomeCatalogue = !initial.category && !initial.flag;

  return <PageContainer className="catalogue-page">
    {isHomeCatalogue && <section className="catalogue-hero"><div className="hero-copy"><p className="eyebrow">A little wonder, every day</p><h1>Play makes room for <em>anything.</em></h1><p>Find thoughtful toys for big imaginations, little discoveries and all the moments in between.</p><div className="hero-actions"><a className="button button-primary" href="#collection">Shop toys <ArrowDownRight size={18} /></a><Link className="button button-secondary" to="/offers">Explore offers <Tag size={17} /></Link></div><div className="hero-note"><ShieldCheck size={17} /><span>A real neighborhood shop. Purchases happen in person.</span></div></div><div className="hero-art"><img src="/toy-images/blocks.svg" alt="Colorful wooden letter blocks" /><div className="hero-art-caption"><span>Made for curious hands</span><span>01 / Play</span></div></div><span className="hero-decoration hero-decoration-one" /><span className="hero-decoration hero-decoration-two" /></section>}
    {isHomeCatalogue && <><FeaturedShowcase /><FeaturedOffers /></>}
    {!isHomeCatalogue && <div className="catalogue-title-row"><div><p className="eyebrow">THE COLLECTION</p><h1>{initial.title || "Explore the collection"}</h1></div><p>Good things to play, learn and share.</p></div>}
    <section id="collection" className="catalogue-section">
      <div className="catalogue-section-heading"><div><p className="eyebrow">THOUGHTFULLY CHOSEN</p><h2>Find their next favorite</h2></div><span>{loading ? "Loading" : `${products.length} toys`}</span></div>
      <div className="catalogue-controls">
        <label className="search-field"><Search size={19} /><span className="sr-only">Search toys</span><input value={filters.q} onChange={(event) => update("q", event.target.value)} placeholder="Search by toy name" /></label>
        <div className="filter-row">
          <label><span>Category</span><select value={filters.category} onChange={(e) => update("category", e.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
          <label><span>Age</span><select value={filters.ageGroup} onChange={(e) => update("ageGroup", e.target.value)}><option value="">All ages</option>{["0–18 months", "6–24 months", "2–4 years", "2–5 years", "3+ years", "3–6 years", "3–7 years", "3–8 years", "4–9 years", "4–10 years", "5+ years", "5–10 years", "5–12 years", "6+ years", "6–12 years", "7–12 years", "All ages"].map((age) => <option key={age}>{age}</option>)}</select></label>
          <label><span>Availability</span><select value={filters.availability} onChange={(e) => update("availability", e.target.value)}><option value="">Any availability</option><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option></select></label>
          <label><span>Sort by</span><select value={filters.sort} onChange={(e) => update("sort", e.target.value)}><option value="relevance">Recommended</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="newest">Newest</option><option value="name">Name</option></select></label>
          <label><span>Min price</span><input type="number" min="0" step="0.01" value={filters.minPrice} onChange={(e) => update("minPrice", e.target.value)} placeholder="Any" /></label>
          <label><span>Max price</span><input type="number" min="0" step="0.01" value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} placeholder="Any" /></label>
          <Button variant="ghost" type="button" onClick={clearFilters}>Clear filters</Button>
        </div>
        <nav className="category-pills" aria-label="Browse toy categories"><Link className={!filters.category ? "active" : ""} to="/">All toys</Link>{categories.map((item) => <Link className={filters.category === item.slug ? "active" : ""} key={item.id} to={`/categories/${item.slug}`}>{item.name}</Link>)}</nav>
      </div>
      {error ? <p role="alert" className="form-error">{error}</p> : loading ? <p className="catalogue-loading" aria-live="polite">Finding the right toys…</p> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h2>No toys match those filters</h2><p>Try a different age, category or price range.</p><Button variant="secondary" type="button" onClick={clearFilters}>Clear all filters</Button></div>}
    </section>
    {isHomeCatalogue && <HomeExtras categories={categories} />}
  </PageContainer>;
}

function HomeExtras({ categories }) {
  const [shop, setShop] = useState(null); const [enquiryStatus, setEnquiryStatus] = useState(""); const [subscriptionStatus, setSubscriptionStatus] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { api.get("/shop").then(({ data }) => setShop(data.data.shop)).catch(() => {}); }, []);
  async function submitEnquiry(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setEnquiryStatus(""); const form = event.currentTarget; const values = new FormData(form);
    try { const payload = { customerName: values.get("customerName"), email: values.get("email") || "", phone: values.get("phone") || "", message: values.get("message"), consent: values.get("consent") === "on" }; const { data } = await api.post("/enquiries", payload); setEnquiryStatus(data.data.message); form.reset(); }
    catch (reason) { setEnquiryStatus(getApiMessage(reason, "Your message could not be sent. Please try again.")); }
    finally { setBusy(false); }
  }
  async function subscribe(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setSubscriptionStatus(""); const form = event.currentTarget; const values = new FormData(form);
    try { const { data } = await api.post("/subscriptions", { email: values.get("email"), consent: values.get("consent") === "on" }); setSubscriptionStatus(data.data.message); form.reset(); }
    catch (reason) { setSubscriptionStatus(getApiMessage(reason, "Could not save your subscription.")); }
    finally { setBusy(false); }
  }
  return <>
    <section className="category-showcase"><div className="editorial-heading"><p className="eyebrow">FIND YOUR KIND OF PLAY</p><h2>Little worlds, ready to explore.</h2><p>Browse by the things they love and see where the afternoon goes.</p></div><div className="category-showcase-grid">{categories.slice(0, 6).map((category, index) => <Link to={`/categories/${category.slug}`} className={`category-showcase-card category-tone-${index % 4}`} key={category.id}><span>0{index + 1}</span><h3>{category.name}</h3><ArrowDownRight size={19} /></Link>)}</div></section>
    <section className="shop-story"><div className="story-art"><img src="/toy-images/teddy.svg" alt="A friendly illustrated teddy bear" /></div><div><p className="eyebrow">A SHOP FOR THE WAY THEY PLAY</p><h2>{shop?.name || "A neighborhood kind of wonder."}</h2><p>{shop?.description || "We believe the best toys invite children to imagine, experiment and make memories together. Come by, take a look around and find something that feels just right."}</p><p>Explore at your own pace. Our team is happy to help you find a thoughtful gift or a new favorite.</p><a className="text-link" href="#contact">Talk with our team <ArrowDownRight size={17} /></a></div></section>
    <section id="contact" className="customer-contact-grid"><div className="newsletter-card"><p className="eyebrow">A NOTE FROM THE TOY SHOP</p><h2>Hear about new arrivals.</h2><p>Leave your email and consent to join the new-arrival list. Delivery is not active yet; the shop will configure an email provider before sending updates.</p><form onSubmit={subscribe}><label>Email address<input type="email" name="email" required maxLength="254" placeholder="you@example.com" /></label><label className="consent-check"><input type="checkbox" name="consent" required />I agree to receive new-arrival updates by email when the shop enables delivery.</label><Button disabled={busy} type="submit">Join the list</Button>{subscriptionStatus && <p role="status" className="form-feedback">{subscriptionStatus}</p>}</form></div>
      <div className="enquiry-card"><p className="eyebrow">WE ARE HERE TO HELP</p><h2>Ask us anything.</h2><form onSubmit={submitEnquiry}><label>Your name<input name="customerName" required minLength="2" maxLength="120" /></label><div className="contact-form-row"><label>Email<input name="email" type="email" maxLength="254" /></label><label>Phone<input name="phone" type="tel" maxLength="40" /></label></div><label>Your message<textarea name="message" required minLength="10" maxLength="2000" rows="3" placeholder="Tell us what you are looking for…" /></label><label className="consent-check"><input type="checkbox" name="consent" required />The shop may use my details to reply to this enquiry.</label><Button disabled={busy} type="submit">Send enquiry</Button>{enquiryStatus && <p role="status" className="form-feedback">{enquiryStatus}</p>}</form></div></section>
  </>;
}

function ProductDetail() {
  const { slug } = useParams(); const [product, setProduct] = useState(null); const [related, setRelated] = useState([]); const [imageIndex, setImageIndex] = useState(0); const [loading, setLoading] = useState(true); const [bookingOpen, setBookingOpen] = useState(false); const [feedback, setFeedback] = useState(""); const [busy, setBusy] = useState(false); const { has, toggle } = useWishlist();
  useEffect(() => { let active = true; setLoading(true); api.get(`/catalogue/products/${slug}`).then(({ data }) => { if (active) { setProduct(data.data.product); setRelated(data.data.relatedProducts || []); setImageIndex(0); } }).catch(() => { if (active) setProduct(null); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [slug]);
  async function submitBooking(event) { event.preventDefault(); if (busy) return; setBusy(true); setFeedback(""); const form = event.currentTarget; const values = new FormData(form); try { const { data } = await api.post("/prebookings", { productId: product.id, customerName: values.get("customerName"), phone: values.get("phone"), email: values.get("email") || "", message: values.get("message") || "", consent: values.get("consent") === "on" }); setBookingOpen(false); setFeedback(data.data.message); } catch (reason) { setFeedback(getApiMessage(reason, "Your request could not be saved. Try again.")); } finally { setBusy(false); } }
  if (loading) return <PageContainer><p>Loading toy details…</p></PageContainer>;
  if (!product) return <PageContainer className="not-found-page"><p className="eyebrow">A LITTLE MISSING PIECE</p><h1>We couldn't find that toy.</h1><Link className="button button-secondary" to="/">Back to the collection</Link></PageContainer>;
  const images = product.images?.length ? product.images : ["/toy-images/blocks.svg"];
  return <PageContainer className="product-detail-page"><nav className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to={`/categories/${product.category?.slug}`}>{product.category?.name || "Toys"}</Link><span>/</span><span>{product.name}</span></nav><div className="product-detail"><div className="detail-gallery"><div className="detail-image"><img src={images[imageIndex]} alt={`${product.name} view ${imageIndex + 1}`} />{product.discountedPrice && <span className="detail-offer-tag">{product.activeOffer?.discountPercent}% off</span>}</div>{images.length > 1 && <div className="detail-thumbnails">{images.map((image, index) => <button key={image} type="button" className={imageIndex === index ? "active" : ""} aria-label={`View image ${index + 1}`} onClick={() => setImageIndex(index)}><img src={image} alt="" /></button>)}</div>}</div><div className="detail-copy"><p className="eyebrow">{product.category?.name || "A PLAYTIME FAVORITE"}</p><h1>{product.name}</h1><p className="detail-description">{product.description}</p>{product.ageGroup && <p className="age-label">Made for <strong>{product.ageGroup}</strong></p>}<div className="detail-price">{product.discountedPrice ? <><del>{product.price}</del><strong>{product.discountedPrice}</strong></> : <strong>{product.price}</strong>}</div>{product.activeOffer && <p className="offer-validity">{product.activeOffer.title} · through {new Date(product.activeOffer.endsAt).toLocaleDateString()}</p>}<p className={`stock-text ${product.availability === "out_of_stock" ? "out" : ""}`}>{product.availability === "out_of_stock" ? "Currently out of stock" : "Available in the shop"}</p><div className="detail-actions"><Button type="button" onClick={() => toggle(product.id)}><Heart size={18} fill={has(product.id) ? "currentColor" : "none"} />{has(product.id) ? "Saved to wishlist" : "Add to wishlist"}</Button>{product.availability === "out_of_stock" && <Button variant="secondary" type="button" onClick={() => setBookingOpen(true)}>Ask about availability</Button>}</div>{feedback && <p role="status" className="form-feedback">{feedback}</p>}<p className="in-store-note"><ShieldCheck size={17} /> Visit the shop to purchase. This site does not take payment.</p></div></div>{related.length > 0 && <section className="related-section"><SectionHeading title="More to discover" action={<Link to={`/categories/${product.category?.slug}`}>Browse this category</Link>} /><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    <Modal title="Ask about this toy" open={bookingOpen} onClose={() => setBookingOpen(false)}><p>Send a request for <strong>{product.name}</strong>. The shop will contact you about availability. This is not an online purchase.</p><form className="contact-form" onSubmit={submitBooking}><label>Your name<input name="customerName" required minLength="2" maxLength="120" autoComplete="name" /></label><label>Phone number<input name="phone" type="tel" required minLength="5" maxLength="40" autoComplete="tel" /></label><label>Email (optional)<input name="email" type="email" maxLength="254" autoComplete="email" /></label><label>Message (optional)<textarea name="message" maxLength="1000" rows="2" /></label><label className="consent-check"><input name="consent" type="checkbox" required />I agree that the shop may use these details to reply to my request.</label><Button disabled={busy} type="submit">{busy ? "Sending…" : "Send request"}</Button></form></Modal>
  </PageContainer>;
}

function OffersPage() {
  const [offers, setOffers] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { api.get("/catalogue/offers").then(({ data }) => setOffers(data.data.offers)).catch((reason) => setError(getApiMessage(reason, "Offers are unavailable right now."))).finally(() => setLoading(false)); }, []);
  return <PageContainer className="catalogue-page offers-page"><p className="eyebrow"><Tag size={16} /> CURRENT OFFERS</p><h1>A little extra play.</h1><p className="offers-intro">Thoughtful finds, for a little less. Visit the shop to purchase.</p>{error && <p className="form-error" role="alert">{error}</p>}{loading ? <p>Checking current offers…</p> : offers.length ? <div className="offer-list">{offers.map((offer) => <section className="offer-card" key={offer.id}><div className="offer-card-heading"><span>{offer.discountPercent}% OFF SELECTED TOYS</span><time>Until {new Date(offer.endsAt).toLocaleDateString()}</time></div><h2>{offer.title}</h2>{offer.description && <p>{offer.description}</p>}<div className="product-grid">{offer.products.map(({ product }) => <ProductCard key={product.id} product={{ ...product, discountedPrice: product.discountedPrice || (Number(product.price) * (100 - offer.discountPercent) / 100).toFixed(2) }} />)}</div></section>)}</div> : <div className="empty-state"><h2>No active offers right now</h2><p>Check back for new ways to play.</p><Link className="button button-secondary" to="/">Browse the collection</Link></div>}</PageContainer>;
}

function LoginPage() {
  const { login } = useAuth(); const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const location = useLocation();
  async function submit(event) { event.preventDefault(); setBusy(true); setError(""); try { await login({ username, password }); window.location.assign(location.state?.from || "/admin"); } catch (reason) { setError(getApiMessage(reason, "Username or password is incorrect.")); } finally { setBusy(false); } }
  return <PageContainer className="auth-page"><form className="admin-form login-form" onSubmit={submit}><div className="login-mark"><ShieldCheck size={27} /></div><p className="eyebrow">TEAM ACCESS</p><h1>Welcome back.</h1><p>Sign in to manage the Toy Shop.</p><label>Username<input type="text" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} /></label><label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p role="alert" className="form-error">{error}</p>}<Button disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in"}</Button><Link to="/">Back to the shop</Link></form></PageContainer>;
}

function ShopSettingsPage() {
  const [form, setForm] = useState({ name: "", description: "", address: "", mapLocation: "", openingHours: "", phone: "", whatsappNumber: "", email: "" });
  const [links, setLinks] = useState([]); const [status, setStatus] = useState(""); const [editingLink, setEditingLink] = useState(null); const [saving, setSaving] = useState(false);
  useEffect(() => { api.get("/shop").then(({ data }) => { setForm((old) => ({ ...old, ...(data.data.shop || {}) })); setLinks(data.data.socialLinks || []); }).catch(() => setStatus("Shop details are unavailable.")); }, []);
  async function saveShop(event) { event.preventDefault(); setSaving(true); setStatus(""); const fields = ["name", "description", "address", "mapLocation", "openingHours", "phone", "whatsappNumber", "email"]; const payload = Object.fromEntries(fields.map((key) => [key, form[key] || null])); try { await api.patch("/admin/shop", payload); setStatus("Shop information saved."); } catch (reason) { setStatus(getApiMessage(reason, "Could not save shop details.")); } finally { setSaving(false); } }
  async function uploadLogo(event) { const file = event.target.files?.[0]; if (!file) return; const body = new FormData(); body.append("logo", file); try { const { data } = await api.post("/admin/shop/logo", body, { headers: { "Content-Type": "multipart/form-data" } }); setForm((old) => ({ ...old, logoUrl: data.data.shop.logoUrl })); setStatus("Shop logo updated."); } catch (reason) { setStatus(getApiMessage(reason, "Logo upload requires Cloudinary configuration.")); } }
  async function saveSocial(event) { event.preventDefault(); const formElement = event.currentTarget; const values = new FormData(formElement); const existing = links.find((item) => item.id === editingLink); const payload = { platform: existing?.platform || values.get("platform"), url: values.get("url"), label: values.get("label") || null, sortOrder: existing?.sortOrder ?? links.length }; try { const { data } = existing ? await api.patch(`/admin/social-links/${existing.id}`, payload) : await api.post("/admin/social-links", payload); setLinks((all) => existing ? all.map((item) => item.id === existing.id ? data.data.socialLink : item) : [...all, data.data.socialLink]); setEditingLink(null); formElement.reset(); setStatus("Social link saved."); } catch (reason) { setStatus(getApiMessage(reason, "Could not save social link.")); } }
  async function removeSocial(link) { if (!window.confirm(`Remove ${link.label || link.platform}?`)) return; try { await api.delete(`/admin/social-links/${link.id}`); setLinks((all) => all.filter((item) => item.id !== link.id)); setStatus("Social link removed."); } catch (reason) { setStatus(getApiMessage(reason, "Could not remove link.")); } }
  return <><div className="admin-page-heading"><div><h2>Shop identity</h2><p>Update the details customers see on the website.</p></div></div><form className="admin-panel admin-form-grid" onSubmit={saveShop}><label>Shop name<input value={form.name || ""} maxLength="160" onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email<input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Phone<input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label>WhatsApp number<input value={form.whatsappNumber || ""} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} /></label><label>Address<input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label><label>Map location<input value={form.mapLocation || ""} onChange={(e) => setForm({ ...form, mapLocation: e.target.value })} placeholder="Address or map search" /></label><label className="admin-form-wide">Opening hours<textarea rows="2" maxLength="1000" value={form.openingHours || ""} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} placeholder="e.g. Monday–Saturday, 10am–7pm" /></label><label className="admin-form-wide">Description<textarea rows="3" maxLength="2000" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label>Shop logo<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={uploadLogo} /></label>{form.logoUrl && <img className="admin-logo-preview" src={form.logoUrl} alt="Current shop logo" />}<Button disabled={saving} type="submit">{saving ? "Saving…" : "Save shop information"}</Button></form><div className="admin-panel"><SectionHeading title="Social links" description="Only secure HTTPS links are accepted." /><div className="admin-record-list">{links.map((link) => <article className="admin-record-card" key={link.id}><div><strong>{link.label || link.platform}</strong><p>{link.url}</p></div><div className="admin-row-actions"><Button variant="ghost" onClick={() => setEditingLink(link.id)}>Edit</Button><Button variant="ghost" onClick={() => removeSocial(link)}>Remove</Button></div></article>)}</div><form key={editingLink || "new-social-link"} className="social-edit-form" onSubmit={saveSocial}><label>Platform<select name="platform" defaultValue={links.find((link) => link.id === editingLink)?.platform || "Instagram"} disabled={Boolean(editingLink)}>{["Instagram", "Facebook", "YouTube", "TikTok", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label><label>URL<input name="url" type="url" placeholder="https://…" defaultValue={links.find((link) => link.id === editingLink)?.url || ""} required /></label><label>Label<input name="label" defaultValue={links.find((link) => link.id === editingLink)?.label || ""} /></label><Button type="submit">{editingLink ? "Save changes" : "Add link"}</Button>{editingLink && <Button variant="ghost" type="button" onClick={() => setEditingLink(null)}>Cancel edit</Button>}</form></div>{status && <p className="admin-status" role="status">{status}</p>}</>;
}

function AdminRoutes() {
  return <Routes><Route path="/admin" element={<ProtectedRoute><AdminShell /></ProtectedRoute>}>
    <Route index element={<DashboardPage />} /><Route path="products" element={<ProductsPage />} /><Route path="categories" element={<CategoriesPage />} /><Route path="offers" element={<AdminOffersPage />} /><Route path="prebookings" element={<PreBookingsPage />} /><Route path="enquiries" element={<EnquiriesPage />} /><Route path="subscribers" element={<SubscribersPage />} /><Route path="settings" element={<ShopSettingsPage />} />
    <Route path="accounts" element={<ProtectedRoute superAdmin><AdminAccountsPage /></ProtectedRoute>} /><Route path="activity" element={<ProtectedRoute superAdmin><ActivityPage /></ProtectedRoute>} />
  </Route><Route path="/admin/*" element={<Navigate to="/admin" replace />} /></Routes>;
}

function StoreRoutes() {
  return <ShopShell><Routes><Route path="/" element={<Catalogue />} /><Route path="/products/:slug" element={<ProductDetail />} /><Route path="/categories/:slug" element={<CatalogueRouteCategory />} /><Route path="/offers" element={<OffersPage />} /><Route path="/wishlist" element={<WishlistPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/admin/login" element={<Navigate to="/login" replace />} /><Route path="/new" element={<Catalogue initial={{ flag: "isNew", title: "New arrivals" }} />} /><Route path="/recommended" element={<Catalogue initial={{ flag: "isRecommended", title: "Recommended for play" }} />} /><Route path="/best-sellers" element={<Catalogue initial={{ flag: "isBestSeller", title: "Shop favorites" }} />} /><Route path="/rare" element={<Catalogue initial={{ flag: "isRare", title: "Rare finds" }} />} /><Route path="*" element={<PageContainer className="not-found-page"><p className="eyebrow">PAGE NOT FOUND</p><h1>This page wandered off.</h1><Link className="button button-secondary" to="/">Back to the collection</Link></PageContainer>} /></Routes></ShopShell>;
}

function CatalogueRouteCategory() { const { slug } = useParams(); return <Catalogue key={slug} initial={{ category: slug, title: "Explore this collection" }} />; }
function WishlistPage() {
  const { productIds } = useWishlist(); const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; if (!productIds.length) { setProducts([]); setLoading(false); return undefined; } setLoading(true); api.get("/catalogue/products", { params: { ids: productIds.join(","), limit: 60 } }).then(({ data }) => { if (active) setProducts(data.data.products); }).catch((reason) => { if (active) setError(getApiMessage(reason, "Your wishlist could not be loaded.")); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [productIds]);
  return <PageContainer className="catalogue-page wishlist-page"><p className="eyebrow">SAVED FOR LATER</p><h1>Your wishlist</h1><p>Your saved toys stay on this device.</p>{error && <p role="alert" className="form-error">{error}</p>}{loading ? <p>Gathering your saved toys…</p> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><Heart size={30} /><h2>Your wishlist is waiting</h2><p>Save toys on this device to find them here later.</p><Link className="button button-secondary" to="/">Explore toys</Link></div>}</PageContainer>;
}

export function App() {
  const location = useLocation();
  return location.pathname.startsWith("/admin") ? <AdminRoutes /> : <StoreRoutes />;
}
export function RootApp() { return <BrowserRouter><App /></BrowserRouter>; }
