import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getApiMessage } from "@/api/http.js";
import { Button, PageContainer, SectionHeading } from "@/components/ui.jsx";
import { useAuth } from "@/context/AuthContext.jsx";

function useAdminResource(path, key) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async (params = {}) => {
    setLoading(true);
    try { const { data } = await api.get(path, { params }); setItems(data.data[key] || []); setError(""); }
    catch (reason) { setError(getApiMessage(reason, "Could not load this information.")); }
    finally { setLoading(false); }
  }, [path, key]);
  useEffect(() => { refresh(); }, [refresh]);
  return { items, setItems, loading, error, refresh, setError };
}

function StatusMessage({ error, children }) { return error ? <p className="form-error" role="alert">{error}</p> : children ? <p className="admin-status" role="status">{children}</p> : null; }

export function DashboardPage() {
  const [data, setData] = useState(null); const [error, setError] = useState(""); const { user } = useAuth();
  useEffect(() => { api.get("/admin/dashboard").then(({ data: result }) => setData(result.data)).catch((reason) => setError(getApiMessage(reason, "Dashboard data is unavailable."))); }, []);
  const stats = data?.stats || {};
  const cards = [["Products", stats.products, "/admin/products"], ["Published products", stats.publishedProducts, "/admin/products"], ["Categories", stats.categories, "/admin/categories"], ["Active offers", stats.activeOffers, "/admin/offers"], ["Pending pre-bookings", stats.pendingBookings, "/admin/prebookings"], ["Open enquiries", stats.openEnquiries, "/admin/enquiries"], ["Active subscribers", stats.subscribers, "/admin/subscribers"], ...(user?.role === "Super Admin" ? [["Active admins", stats.admins, "/admin/accounts"]] : [])];
  return <>
    <div className="admin-welcome"><div><p className="eyebrow">{user?.role === "Super Admin" ? "OWNER ACCESS" : "STORE WORKSPACE"}</p><h2>Welcome back, {user?.fullName?.split(" ")[0]}.</h2><p>Here is what is happening across your shop today.</p></div><Link className="button button-primary" to="/admin/products">Add a product</Link></div>
    {error && <StatusMessage error={error} />}
    <div className="admin-stat-grid">{cards.map(([label, value, path]) => <Link className="admin-stat-card" key={label} to={path}><span>{label}</span><strong>{data ? value : "—"}</strong><small>View details <span aria-hidden="true">↗</span></small></Link>)}</div>
    <section className="admin-panel"><SectionHeading title="Recent activity" description="Recent changes made by your team." action={<Link to={user?.role === "Super Admin" ? "/admin/activity" : "/admin/products"}>See activity</Link>} />{data?.recentActivity?.length ? <div className="activity-list">{data.recentActivity.map((entry) => <article key={entry.id}><span className="activity-dot" /><div><strong>{entry.action}</strong><p>{entry.details || entry.targetType} · {entry.admin?.fullName || "Former admin"}</p></div><time>{new Date(entry.createdAt).toLocaleString()}</time></article>)}</div> : <p className="admin-muted">Your team's changes will appear here.</p>}</section>
    <div className="admin-quick-links"><Link to="/admin/prebookings">Review requests</Link><Link to="/admin/enquiries">Read enquiries</Link><Link to="/admin/settings">Update shop details</Link></div>
  </>;
}

const emptyProduct = { name: "", slug: "", categoryId: "", price: "", description: "", ageGroup: "", stockQuantity: 0, images: [], isPublished: true, isRare: false, isNew: false, isRecommended: false, isBestSeller: false };
function slugify(value) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export function ProductsPage() {
  const { items: products, loading, error, refresh, setError } = useAdminResource("/admin/catalogue/products", "products");
  const { items: categories } = useAdminResource("/admin/catalogue/categories", "categories");
  const [form, setForm] = useState(null); const [saving, setSaving] = useState(false); const [query, setQuery] = useState(""); const [saved, setSaved] = useState("");
  function beginEdit(product = emptyProduct) { setSaved(""); setError(""); setForm({ ...emptyProduct, ...product, price: product.price?.toString() || "", categoryId: product.categoryId || "", images: product.images || [] }); }
  async function submit(event) {
    event.preventDefault(); if (!form || saving) return; setSaving(true); setError("");
    const payload = { ...form, slug: form.slug || slugify(form.name), categoryId: form.categoryId || null, price: String(form.price), stockQuantity: Number(form.stockQuantity), ageGroup: form.ageGroup || null, description: form.description || null };
    try { if (form.id) await api.patch(`/admin/catalogue/products/${form.id}`, payload); else await api.post("/admin/catalogue/products", payload); setSaved(form.id ? "Product updated." : "Product created."); setForm(null); await refresh({ q: query }); }
    catch (reason) { setError(getApiMessage(reason, "Product could not be saved.")); }
    finally { setSaving(false); }
  }
  async function remove(product) { if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return; try { await api.delete(`/admin/catalogue/products/${product.id}`); await refresh({ q: query }); setSaved("Product deleted."); } catch (reason) { setError(getApiMessage(reason, "Could not delete this product. Existing requests may reference it.")); } }
  async function uploadImage(event) { const file = event.target.files?.[0]; if (!file || !form) return; const body = new FormData(); body.append("image", file); try { const { data } = await api.post("/admin/catalogue/products/images", body, { headers: { "Content-Type": "multipart/form-data" } }); setForm((current) => ({ ...current, images: [...current.images, data.data.url] })); } catch (reason) { setError(getApiMessage(reason, "Image upload requires Cloudinary configuration.")); } }
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <>
    <div className="admin-page-heading"><div><h2>Product catalogue</h2><p>Keep your product details and stock up to date.</p></div><Button type="button" onClick={() => beginEdit()}>Add product</Button></div>
    <StatusMessage error={error}>{saved}</StatusMessage>
    <form className="admin-filter-bar" onSubmit={(event) => { event.preventDefault(); refresh({ q: query }); }}><input aria-label="Search products" placeholder="Search name or slug" value={query} onChange={(event) => setQuery(event.target.value)} /><Button variant="secondary" type="submit">Search</Button></form>
    {form && <form className="admin-panel admin-edit-form" onSubmit={submit}><SectionHeading title={form.id ? "Edit product" : "New product"} action={<Button variant="ghost" type="button" onClick={() => setForm(null)}>Close</Button>} />
      <div className="admin-form-grid"><label>Product name<input value={form.name} required maxLength="160" onChange={(e) => setField("name", e.target.value)} /></label><label>Slug<input value={form.slug} required onChange={(e) => setField("slug", slugify(e.target.value))} /></label>
        <label>Category<select value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label>Price<input type="number" inputMode="decimal" min="0" step="0.01" value={form.price} required onChange={(e) => setField("price", e.target.value)} /></label><label>Age group<input placeholder="3–6 years" value={form.ageGroup} onChange={(e) => setField("ageGroup", e.target.value)} /></label><label>Stock quantity<input type="number" min="0" step="1" value={form.stockQuantity} required onChange={(e) => setField("stockQuantity", e.target.value)} /></label>
        <label className="admin-form-wide">Description<textarea rows="3" value={form.description || ""} onChange={(e) => setField("description", e.target.value)} /></label>
        <label className="admin-form-wide">Product image URLs (one per line)<textarea rows="2" value={form.images.join("\n")} onChange={(e) => setField("images", e.target.value.split("\n").map((line) => line.trim()).filter(Boolean))} /></label>
        <label className="admin-form-wide">Upload product image<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={uploadImage} /></label>
        <div className="admin-checkbox-row">{[["isPublished","Published"],["isRecommended","Recommended"],["isNew","New arrival"],["isBestSeller","Best seller"],["isRare","Rare find"]].map(([key,label]) => <label key={key}><input type="checkbox" checked={Boolean(form[key])} onChange={(e) => setField(key, e.target.checked)} />{label}</label>)}</div>
      </div><Button disabled={saving} type="submit">{saving ? "Saving…" : "Save product"}</Button>
    </form>}
    <div className="admin-panel admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-cell">{product.images?.[0] && <img src={product.images[0]} alt="" />}<span><strong>{product.name}</strong><small>{product.slug}</small></span></div></td><td>{product.category?.name || "—"}</td><td>{product.price}</td><td><span className={`stock-indicator ${product.stockQuantity === 0 ? "out" : ""}`}>{product.stockQuantity} · {product.stockQuantity ? "In stock" : "Out of stock"}</span></td><td>{product.isPublished ? "Published" : "Draft"}</td><td className="admin-row-actions"><Button variant="ghost" type="button" onClick={() => beginEdit(product)}>Edit</Button><Button variant="ghost" type="button" onClick={() => remove(product)}>Delete</Button></td></tr>)}</tbody></table>{loading && <p>Loading products…</p>}{!loading && !products.length && <p className="admin-muted">No products found. Add a product to start your catalogue.</p>}</div>
  </>;
}

const emptyCategory = { name: "", slug: "", description: "", sortOrder: 0, isPublished: true };
export function CategoriesPage() {
  const { items: categories, loading, error, refresh, setError } = useAdminResource("/admin/catalogue/categories", "categories");
  const [form, setForm] = useState(null); const [saved, setSaved] = useState("");
  async function submit(event) { event.preventDefault(); try { const payload = { ...form, slug: form.slug || slugify(form.name), sortOrder: Number(form.sortOrder), description: form.description || null }; if (form.id) await api.patch(`/admin/catalogue/categories/${form.id}`, payload); else await api.post("/admin/catalogue/categories", payload); setSaved("Category saved."); setForm(null); await refresh(); } catch (reason) { setError(getApiMessage(reason, "Could not save category.")); } }
  async function remove(category) { if (!window.confirm(`Delete ${category.name}? Categories with products cannot be deleted.`)) return; try { await api.delete(`/admin/catalogue/categories/${category.id}`); await refresh(); setSaved("Category deleted."); } catch (reason) { setError(getApiMessage(reason, "Could not delete category.")); } }
  return <><div className="admin-page-heading"><div><h2>Categories</h2><p>Organize the toys into easy-to-browse collections.</p></div><Button onClick={() => { setSaved(""); setForm({ ...emptyCategory }); }}>Add category</Button></div><StatusMessage error={error}>{saved}</StatusMessage>{form && <form className="admin-panel admin-form-grid" onSubmit={submit}><label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, ...(form.id ? {} : { slug: slugify(e.target.value) }) })} required /></label><label>Slug<input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} required /></label><label>Sort order<input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></label><label>Description<input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label><Button type="submit">Save category</Button><Button variant="ghost" type="button" onClick={() => setForm(null)}>Cancel</Button></form>}<div className="admin-panel admin-table-wrap"><table className="admin-table"><thead><tr><th>Category</th><th>Products</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td><strong>{category.name}</strong><small>{category.slug}</small></td><td>{category._count?.products ?? "—"}</td><td>{category.isPublished ? "Published" : "Hidden"}</td><td className="admin-row-actions"><Button variant="ghost" onClick={() => setForm({ ...category, description: category.description || "" })}>Edit</Button><Button variant="ghost" onClick={() => remove(category)}>Delete</Button></td></tr>)}</tbody></table>{loading && <p>Loading categories…</p>}{!loading && !categories.length && <p className="admin-muted">No categories created yet.</p>}</div></>;
}

function toLocalInput(date) { const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); }
export function OffersPage() {
  const { items: offers, loading, error, refresh, setError } = useAdminResource("/admin/catalogue/offers", "offers");
  const { items: products } = useAdminResource("/admin/catalogue/products", "products");
  const [form, setForm] = useState(null); const [saved, setSaved] = useState("");
  async function submit(event) { event.preventDefault(); try { const values = new FormData(event.currentTarget); const payload = { title: values.get("title"), description: values.get("description") || null, discountPercent: Number(values.get("discountPercent")), startsAt: new Date(values.get("startsAt")).toISOString(), endsAt: new Date(values.get("endsAt")).toISOString(), isPublished: values.get("isPublished") === "on", productIds: Array.from(event.currentTarget.querySelectorAll('[name="productIds"]:checked')).map((input) => input.value) }; if (form?.id) await api.patch(`/admin/catalogue/offers/${form.id}`, payload); else await api.post("/admin/catalogue/offers", payload); setForm(null); setSaved("Offer saved."); await refresh(); } catch (reason) { setError(getApiMessage(reason, "Could not save offer.")); } }
  async function remove(offer) { if (!window.confirm(`Delete offer “${offer.title}”?`)) return; try { await api.delete(`/admin/catalogue/offers/${offer.id}`); await refresh(); } catch (reason) { setError(getApiMessage(reason, "Could not delete offer.")); } }
  return <><div className="admin-page-heading"><div><h2>Offers</h2><p>Set a discount, its dates, and which products it covers.</p></div><Button onClick={() => { setForm({}); setSaved(""); }}>Create offer</Button></div><StatusMessage error={error}>{saved}</StatusMessage>{form && <form className="admin-panel admin-form-grid" onSubmit={submit}><label>Offer name<input name="title" defaultValue={form.title || ""} required /></label><label>Discount percent<input name="discountPercent" type="number" min="1" max="90" defaultValue={form.discountPercent || 15} required /></label><label>Starts<input name="startsAt" type="datetime-local" defaultValue={form.startsAt ? toLocalInput(new Date(form.startsAt)) : toLocalInput(new Date())} required /></label><label>Ends<input name="endsAt" type="datetime-local" defaultValue={form.endsAt ? toLocalInput(new Date(form.endsAt)) : toLocalInput(new Date(Date.now() + 14 * 86400000))} required /></label><label className="admin-form-wide">Description<textarea name="description" defaultValue={form.description || ""} rows="2" /></label><div className="product-check-grid admin-form-wide">{products.map((product) => <label key={product.id}><input name="productIds" type="checkbox" value={product.id} defaultChecked={form.products?.some(({ product: item }) => item.id === product.id) || false} />{product.name}</label>)}</div><label><input name="isPublished" type="checkbox" defaultChecked={form.isPublished ?? true} /> Active</label><Button type="submit">Save offer</Button><Button variant="ghost" type="button" onClick={() => setForm(null)}>Cancel</Button></form>}<div className="admin-panel admin-table-wrap"><table className="admin-table"><thead><tr><th>Offer</th><th>Discount</th><th>Validity</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead><tbody>{offers.map((offer) => <tr key={offer.id}><td><strong>{offer.title}</strong><small>{offer.description}</small></td><td>{offer.discountPercent}% off</td><td>{new Date(offer.startsAt).toLocaleDateString()} – {new Date(offer.endsAt).toLocaleDateString()}</td><td>{offer.products.length}</td><td>{offer.isPublished && new Date(offer.startsAt) <= new Date() && new Date(offer.endsAt) > new Date() ? "Active" : offer.isPublished ? "Scheduled / expired" : "Paused"}</td><td className="admin-row-actions"><Button variant="ghost" onClick={() => setForm(offer)}>Edit</Button><Button variant="ghost" onClick={() => remove(offer)}>Delete</Button></td></tr>)}</tbody></table>{loading && <p>Loading offers…</p>}</div></>;
}

const bookingStatuses = ["Pending", "Contacted", "Confirmed", "Rejected"];
export function PreBookingsPage() {
  const { items, loading, error, refresh, setError } = useAdminResource("/prebookings", "preBookings"); const [query, setQuery] = useState("");
  async function update(id, status) { try { await api.patch(`/prebookings/${id}`, { status }); await refresh({ q: query }); } catch (reason) { setError(getApiMessage(reason, "Could not update request.")); } }
  return <><div className="admin-page-heading"><div><h2>Pre-bookings</h2><p>Availability enquiries from visitors. No online purchases are taken.</p></div><form className="admin-filter-bar" onSubmit={(e) => { e.preventDefault(); refresh({ q: query }); }}><input placeholder="Search name, phone, product" value={query} onChange={(e) => setQuery(e.target.value)} /><Button variant="secondary">Search</Button></form></div><StatusMessage error={error} /><div className="admin-record-list">{items.map((item) => <article className="admin-record-card" key={item.id}><div><span className="record-kicker">{new Date(item.createdAt).toLocaleString()}</span><h3>{item.product.name}</h3><p>{item.customerName} · <a href={`tel:${item.phone}`}>{item.phone}</a>{item.email && <> · <a href={`mailto:${item.email}`}>{item.email}</a></>}</p>{item.message && <p>{item.message}</p>}</div><label>Status<select value={item.status} onChange={(e) => update(item.id, e.target.value)}>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></article>)}{loading && <p>Loading requests…</p>}{!loading && !items.length && <p className="admin-panel admin-muted">No pre-booking requests yet.</p>}</div></>;
}

export function EnquiriesPage() {
  const { items, loading, error, refresh, setError } = useAdminResource("/enquiries", "enquiries");
  async function update(id, status) { try { await api.patch(`/enquiries/${id}`, { status }); await refresh(); } catch (reason) { setError(getApiMessage(reason, "Could not update enquiry.")); } }
  return <>
    <div className="admin-page-heading"><div><h2>Customer enquiries</h2><p>Messages submitted through the website contact form.</p></div></div>
    <StatusMessage error={error} />
    <div className="admin-record-list">
      {items.map((item) => <article className="admin-record-card" key={item.id}>
        <div><span className="record-kicker">{new Date(item.createdAt).toLocaleString()}</span>
          <h3>{item.customerName}{item.product ? ` · ${item.product.name}` : ""}</h3>
          <p>{item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}{item.phone && <><span> · </span><a href={`tel:${item.phone}`}>{item.phone}</a></>}</p>
          <p>{item.message}</p>
        </div>
        <label>Status<select value={item.status} onChange={(e) => update(item.id, e.target.value)}>{["New", "Read", "Resolved"].map((status) => <option key={status}>{status}</option>)}</select></label>
      </article>)}
      {loading && <p>Loading enquiries…</p>}{!loading && !items.length && <p className="admin-panel admin-muted">No enquiries received yet.</p>}
    </div>
  </>;
}

export function SubscribersPage() {
  const { items, loading, error, refresh, setError } = useAdminResource("/subscriptions", "subscribers");
  async function toggle(item) { try { await api.patch(`/subscriptions/${item.id}`, { isActive: !item.isActive }); await refresh(); } catch (reason) { setError(getApiMessage(reason, "Could not update subscriber.")); } }
  return <><div className="admin-page-heading"><div><h2>Notification subscribers</h2><p>Consent records for new-arrival emails. Delivery remains disabled until a provider is configured.</p></div></div><StatusMessage error={error} /><div className="admin-panel admin-table-wrap"><table className="admin-table"><thead><tr><th>Email</th><th>Consented</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.email}</td><td>{new Date(item.consentedAt).toLocaleDateString()}</td><td>{item.isActive ? "Subscribed" : "Unsubscribed"}</td><td><Button variant="ghost" onClick={() => toggle(item)}>{item.isActive ? "Unsubscribe" : "Reactivate"}</Button></td></tr>)}</tbody></table>{loading && <p>Loading subscribers…</p>}{!loading && !items.length && <p className="admin-muted">No subscribers yet.</p>}</div></>;
}

export function AdminAccountsPage() {
  const { items, loading, error, refresh, setError } = useAdminResource("/admins", "admins"); const [saved, setSaved] = useState("");
  async function create(event) { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); const payload = Object.fromEntries(values); try { await api.post("/admins", payload); form.reset(); await refresh(); setSaved("Admin created."); } catch (reason) { setError(getApiMessage(reason, "Could not create account.")); } }
  async function update(admin, patch) { try { await api.patch(`/admins/${admin.id}`, patch); await refresh(); setSaved("Admin account updated."); } catch (reason) { setError(getApiMessage(reason, "Could not update account.")); } }
  async function deactivate(admin) { if (!window.confirm(`Deactivate ${admin.username}? They will not be able to sign in.`)) return; await update(admin, { isActive: false }); }
  return <><div className="admin-page-heading"><div><h2>Admin accounts</h2><p>Create and manage staff accounts. Only this Super Admin can access the section.</p></div></div><StatusMessage error={error}>{saved}</StatusMessage><form className="admin-panel admin-form-grid" onSubmit={create}><h3 className="admin-form-wide">Create an Admin</h3><label>Full name<input name="fullName" required maxLength="120" /></label><label>Username<input name="username" required minLength="3" maxLength="40" autoComplete="off" /></label><label>Email (optional)<input name="email" type="email" /></label><label>Temporary password<input name="password" type="password" required minLength="8" autoComplete="new-password" /></label><Button type="submit">Create Admin</Button></form><div className="admin-panel admin-table-wrap"><table className="admin-table"><thead><tr><th>Admin</th><th>Last sign in</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((admin) => <tr key={admin.id}><td><strong>{admin.fullName}</strong><small>@{admin.username} · {admin.email}</small></td><td>{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}</td><td>{admin.isActive ? "Active" : "Inactive"}</td><td className="admin-row-actions">{admin.isActive && <Button variant="ghost" onClick={() => deactivate(admin)}>Deactivate</Button>}{!admin.isActive && <Button variant="ghost" onClick={() => update(admin, { isActive: true })}>Reactivate</Button>}</td></tr>)}</tbody></table>{loading && <p>Loading accounts…</p>}</div></>;
}

export function ActivityPage() {
  const { items, loading, error } = useAdminResource("/admin/activity", "activities");
  return <><div className="admin-page-heading"><div><h2>Administrative activity</h2><p>Recent changes made by active and former administrators.</p></div></div><StatusMessage error={error} /><div className="admin-panel activity-list">{items.map((entry) => <article key={entry.id}><span className="activity-dot" /><div><strong>{entry.action}</strong><p>{entry.details || entry.targetType} · {entry.admin?.fullName || "Former admin"}</p></div><time>{new Date(entry.createdAt).toLocaleString()}</time></article>)}{loading && <p>Loading activity…</p>}{!loading && !items.length && <p className="admin-muted">No activity has been recorded yet.</p>}</div></>;
}
