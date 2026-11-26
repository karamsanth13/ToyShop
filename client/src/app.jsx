import { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import { Heart, Search, LogOut, Shield, Tag } from "lucide-react";
import { api } from "@/api/http.js";
import { ShopShell } from "@/components/layout.jsx";
import { Button, PageContainer, SectionHeading } from "@/components/ui.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { useWishlist } from "@/context/WishlistContext.jsx";
import { useAuth } from "@/context/AuthContext.jsx";

function ProductCard({ product }) {
  const { has, toggle } = useWishlist();
  return <article className="product-card">
    <Link to={`/products/${product.slug}`} className="product-image-wrap">{product.images?.[0] ? <img src={product.images[0]} alt={product.name} loading="lazy" /> : <div className="product-image-placeholder">Toy Shop</div>}<span className={`stock-badge ${product.availability === "out_of_stock" ? "out" : ""}`}>{product.availability === "out_of_stock" ? "Out of stock" : "In stock"}</span></Link>
    <div className="product-card-content"><p className="product-category">{product.category?.name || "Toy"}</p><Link to={`/products/${product.slug}`}><h3>{product.name}</h3></Link><div className="product-card-bottom"><span>{product.price}</span><Button variant="ghost" type="button" aria-label={`${has(product.id) ? "Remove" : "Add"} ${product.name} ${has(product.id) ? "from" : "to"} wishlist`} onClick={() => toggle(product.id)}><Heart fill={has(product.id) ? "currentColor" : "none"} size={20} /></Button></div></div>
  </article>;
}

function Catalogue({ initial = {} }) {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState(params.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const category = initial.category || params.get("category") || "";
  useEffect(() => { api.get("/catalogue/categories").then(({ data }) => setCategories(data.data.categories)).catch(() => {}); }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    api.get("/catalogue/products", { params: { ...(query ? { q: query } : {}), ...(category ? { category } : {}), ...(initial.flag ? { flag: initial.flag } : {}), limit: 48 } })
      .then(({ data }) => { if (active) setProducts(data.data.products); }).catch(() => { if (active) setError("We couldn't load the toys. Please try again."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, category, initial.flag]);
  return <PageContainer className="catalogue-page">
    <section className="catalogue-hero"><p className="eyebrow">A little joy for every day</p><h1>{initial.title || "Find your next favorite toy"}</h1><p>Explore the shop's collection and visit us in person to bring your favorites home.</p></section>
    <div className="catalogue-toolbar"><label className="search-field"><Search size={19} /><span className="sr-only">Search toys</span><input value={query} onChange={(event) => { setQuery(event.target.value); setParams(event.target.value ? { q: event.target.value } : {}); }} placeholder="Search toys" /></label>
          <nav className="category-pills" aria-label="Product categories"><Link className={!category ? "active" : ""} to="/">All toys</Link>{categories.map((item) => <Link className={category === item.slug ? "active" : ""} key={item.id} to={`/categories/${item.slug}`}>{item.name}</Link>)}</nav>
    </div>
    {!initial.category && !initial.flag && !query && <FeaturedShowcase />}
    {error ? <p role="alert" className="form-error">{error}</p> : loading ? <p aria-live="polite">Loading toys…</p> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h2>No toys found</h2><p>Try another search or browse all toys.</p><Link className="button button-secondary" to="/">Browse all toys</Link></div>}
  </PageContainer>;
}

function FeaturedShowcase() {
  const [sections, setSections] = useState({});
  useEffect(() => {
    let active = true;
    Promise.all(["isRecommended", "isNew", "isRare"].map((flag) => api.get("/catalogue/products", { params: { flag, limit: 4 } }).then(({ data }) => [flag, data.data.products]).catch(() => [flag, []])))
      .then((entries) => { if (active) setSections(Object.fromEntries(entries)); });
    return () => { active = false; };
  }, []);
  const groups = [["isRecommended", "Recommended for play", "/recommended"], ["isNew", "New arrivals", "/new"], ["isRare", "Rare finds", "/rare"]];
  return <div className="featured-showcase">{groups.map(([key, title, path]) => sections[key]?.length ? <section className="featured-section" key={key}><SectionHeading title={title} action={<Link to={path}>See all</Link>} /><div className="product-grid">{sections[key].map((product) => <ProductCard key={product.id} product={product} />)}</div></section> : null)}<Link className="button button-ghost" to="/offers"><Tag size={18} />See current offers</Link></div>;
}

function ProductDetail() {
  const { slug } = useParams(); const [product, setProduct] = useState(null); const [loading, setLoading] = useState(true); const { has, toggle } = useWishlist();
  useEffect(() => { api.get(`/catalogue/products/${slug}`).then(({ data }) => setProduct(data.data.product)).catch(() => setProduct(null)).finally(() => setLoading(false)); }, [slug]);
  if (loading) return <PageContainer><p>Loading toy…</p></PageContainer>;
  if (!product) return <PageContainer><h1>Toy not found</h1><Link to="/">Back to the collection</Link></PageContainer>;
  return <PageContainer className="product-detail"><div className="detail-image">{product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <div className="product-image-placeholder">Toy Shop</div>}</div><div><p className="eyebrow">{product.category?.name || "Toy"}</p><h1>{product.name}</h1><p>{product.description}</p><p className="detail-price">{product.price}</p><p className={product.availability === "out_of_stock" ? "stock-text out" : "stock-text"}>{product.availability === "out_of_stock" ? "Currently out of stock" : "Available in store"}</p><Button type="button" variant="secondary" onClick={() => toggle(product.id)}><Heart size={19} fill={has(product.id) ? "currentColor" : "none"} />{has(product.id) ? "Saved to wishlist" : "Add to wishlist"}</Button></div></PageContainer>;
}

function OffersPage() {
  const [offers, setOffers] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/catalogue/offers").then(({ data }) => setOffers(data.data.offers)).catch(() => setOffers([])).finally(() => setLoading(false)); }, []);
  return <PageContainer className="catalogue-page"><p className="eyebrow"><Tag size={16} /> Current offers</p><h1>Special offers</h1>{loading ? <p>Checking current offers…</p> : offers.length ? <div className="offer-list">{offers.map((offer) => <section className="offer-card" key={offer.id}><h2>{offer.title}</h2>{offer.description && <p>{offer.description}</p>}<p>Offer ends {new Date(offer.endsAt).toLocaleDateString()}</p><div className="product-grid">{offer.products.map(({ product }) => <ProductCard key={product.id} product={product} />)}</div></section>)}</div> : <div className="empty-state"><h2>No active offers</h2><p>Check back later for current offers from the shop.</p><Link className="button button-secondary" to="/">Browse toys</Link></div>}</PageContainer>;
}

function LoginPage() {
  const { login } = useAuth(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event) { event.preventDefault(); setBusy(true); setError(""); try { await login({ email, password }); window.location.assign("/admin"); } catch { setError("Email or password is incorrect."); } finally { setBusy(false); } }
  return <PageContainer className="auth-page"><form className="admin-form" onSubmit={submit}><Shield size={28} /><h1>Admin sign in</h1><label>Email<input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p role="alert" className="form-error">{error}</p>}<Button disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in"}</Button></form></PageContainer>;
}

function AdminHome() {
  const { user, logout } = useAuth();
  return <PageContainer className="admin-page"><p className="eyebrow">Administration</p><h1>Welcome, {user.fullName}</h1><p>Manage the shop identity and contact information for visitors.</p><div className="admin-links"><Link className="button button-secondary" to="/admin/settings">Shop settings</Link>{user.role === "Super Admin" && <Link className="button button-secondary" to="/admin/accounts">Admin accounts</Link>}</div><Button variant="ghost" onClick={async () => { await logout(); window.location.assign("/"); }}><LogOut size={18} />Sign out</Button></PageContainer>;
}

function SettingsPage() {
  const [form, setForm] = useState({ name: "", description: "", address: "", mapLocation: "", phone: "", whatsappNumber: "", email: "" }); const [links, setLinks] = useState([]); const [status, setStatus] = useState(""); const [editingLink, setEditingLink] = useState(null);
  useEffect(() => { api.get("/shop").then(({ data }) => { setForm((old) => ({ ...old, ...(data.data.shop || {}) })); setLinks(data.data.socialLinks || []); }).catch(() => {}); }, []);
  async function submit(event) { event.preventDefault(); setStatus(""); try { await api.patch("/admin/shop", form); setStatus("Shop details saved."); } catch { setStatus("Could not save shop details. Please try again."); } }
  async function addLink(event) { event.preventDefault(); const values = new FormData(event.currentTarget); try { const { data } = await api.post("/admin/social-links", { platform: values.get("platform"), label: values.get("label") || null, url: values.get("url"), sortOrder: links.length }); setLinks((current) => [...current, data.data.socialLink]); event.currentTarget.reset(); setStatus("Social link added."); } catch { setStatus("Could not add this social link."); } }
  async function removeLink(id) { try { await api.delete(`/admin/social-links/${id}`); setLinks((current) => current.filter((item) => item.id !== id)); } catch { setStatus("Could not remove this social link."); } }
  async function updateLink(event) { event.preventDefault(); const values = new FormData(event.currentTarget); const current = links.find((link) => link.id === editingLink); if (!current) return; try { const { data } = await api.patch(`/admin/social-links/${editingLink}`, { platform: current.platform, url: values.get("url"), label: values.get("label") || null, sortOrder: current.sortOrder }); setLinks((all) => all.map((link) => link.id === editingLink ? data.data.socialLink : link)); setEditingLink(null); setStatus("Social link updated."); } catch { setStatus("Could not update this social link."); } }
  async function uploadLogo(event) { const file = event.target.files?.[0]; if (!file) return; const body = new FormData(); body.append("logo", file); try { await api.post("/admin/shop/logo", body, { headers: { "Content-Type": "multipart/form-data" } }); setStatus("Shop logo updated."); } catch { setStatus("Could not upload the logo. Check the image format and Cloudinary setup."); } }
  return <PageContainer className="admin-page"><h1>Shop settings</h1><form className="admin-form settings-form" onSubmit={submit}>{[["name","Shop name"],["description","Description"],["address","Address"],["mapLocation","Map location or search address"],["phone","Phone"],["whatsappNumber","WhatsApp number"],["email","Email"]].map(([key,label])=><label key={key}>{label}{key === "description" ? <textarea value={form[key] || ""} onChange={(e)=>setForm({...form,[key]:e.target.value})} /> : <input type={key === "email" ? "email" : "text"} value={form[key] || ""} onChange={(e)=>setForm({...form,[key]:e.target.value})} />}</label>)}<label>Shop logo<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={uploadLogo} /></label><Button type="submit">Save shop details</Button></form><section className="admin-form"><h2>Social links</h2><ul className="admin-social-list">{links.map((link)=><li key={link.id}><div><span>{link.label || link.platform}: {link.url}</span>{editingLink === link.id && <form className="social-edit-form" onSubmit={updateLink}><label>URL<input name="url" type="url" defaultValue={link.url} required /></label><label>Label<input name="label" defaultValue={link.label || ""} /></label><Button type="submit">Save</Button></form>}</div><div><Button variant="ghost" type="button" onClick={()=>setEditingLink(editingLink === link.id ? null : link.id)}>{editingLink === link.id ? "Cancel" : "Edit"}</Button><Button variant="ghost" type="button" onClick={()=>removeLink(link.id)}>Remove</Button></div></li>)}</ul><form className="social-edit-form" onSubmit={addLink}><label>Platform<select name="platform" defaultValue="Instagram">{[["Instagram","Instagram"],["Facebook","Facebook"],["YouTube","YouTube"],["TikTok","TikTok"],["Other","Other"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>URL<input name="url" type="url" placeholder="https://…" required /></label><label>Label<input name="label" /></label><Button type="submit">Add link</Button></form></section>{status && <p role="status">{status}</p>}</PageContainer>;
}

function AdminAccountsPage() {
  const [admins, setAdmins] = useState([]); const [status, setStatus] = useState("");
  async function refresh() { try { const { data } = await api.get("/admins"); setAdmins(data.data.admins); } catch { setStatus("Could not load admin accounts."); } }
  useEffect(() => { refresh(); }, []);
  async function create(event) { event.preventDefault(); const values = new FormData(event.currentTarget); try { await api.post("/admins", Object.fromEntries(values)); event.currentTarget.reset(); await refresh(); setStatus("Admin account created."); } catch (error) { setStatus(error.response?.data?.error?.message || "Could not create the account."); } }
  async function remove(id) { if (!window.confirm("Remove this Admin account?")) return; try { await api.delete(`/admins/${id}`); await refresh(); setStatus("Admin account removed."); } catch { setStatus("Could not remove this account."); } }
  return <PageContainer className="admin-page"><h1>Admin accounts</h1><form className="admin-form" onSubmit={create}><h2>Add Admin</h2><label>Name<input name="fullName" required maxLength="120" /></label><label>Email<input name="email" type="email" required /></label><label>Temporary password<input name="password" type="password" required minLength="12" autoComplete="new-password" /></label><p>Share the initial password securely with the new Admin.</p><Button type="submit">Create Admin</Button></form><ul className="admin-form admin-social-list">{admins.map((admin)=><li key={admin.id}><span>{admin.fullName}<br />{admin.email}</span><Button variant="ghost" type="button" onClick={()=>remove(admin.id)}>Remove</Button></li>)}</ul>{status && <p role="status">{status}</p>}</PageContainer>;
}

function WishlistPage() {
  const { productIds } = useWishlist(); const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; if (!productIds.length) { setProducts([]); setLoading(false); return undefined; } api.get("/catalogue/products", { params: { ids: productIds.join(","), limit: 60 } }).then(({ data }) => { if (active) setProducts(data.data.products); }).catch(() => { if (active) setProducts([]); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [productIds]);
  return <PageContainer className="catalogue-page"><h1>Your wishlist</h1>{loading ? <p>Loading your saved toys…</p> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><Heart size={28} /><h2>Your wishlist is waiting</h2><p>Save toys on this device to find them again later.</p><Link className="button button-secondary" to="/">Browse toys</Link></div>}</PageContainer>;
}

function CategoryRoute() { const { slug } = useParams(); return <Catalogue key={slug} initial={{ category: slug, title: "Explore the collection" }} />; }
function AppRoutes() { return <ShopShell><Routes><Route path="/" element={<Catalogue />} /><Route path="/products/:slug" element={<ProductDetail />} /><Route path="/categories/:slug" element={<CategoryRoute />} /><Route path="/offers" element={<OffersPage />} /><Route path="/wishlist" element={<WishlistPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/admin" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} /><Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} /><Route path="/admin/accounts" element={<ProtectedRoute superAdmin><AdminAccountsPage /></ProtectedRoute>} /><Route path="/new" element={<Catalogue initial={{ flag: "isNew", title: "New arrivals" }} />} /><Route path="/recommended" element={<Catalogue initial={{ flag: "isRecommended", title: "Recommended toys" }} />} /><Route path="/rare" element={<Catalogue initial={{ flag: "isRare", title: "Rare finds" }} />} /><Route path="*" element={<PageContainer><h1>Page not found</h1><Link to="/">Back to the collection</Link></PageContainer>} /></Routes></ShopShell>; }
export function App() { return <BrowserRouter><AppRoutes /></BrowserRouter>; }
