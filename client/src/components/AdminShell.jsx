import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Activity, Boxes, ChartNoAxesCombined, ChevronRight, ClipboardList, FolderTree, Gift, LogOut, Mail, Menu, Settings, Shield, Users, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";
import { Button } from "@/components/ui.jsx";

const sharedLinks = [
  ["/admin", "Overview", ChartNoAxesCombined, true],
  ["/admin/products", "Products", Boxes],
  ["/admin/categories", "Categories", FolderTree],
  ["/admin/offers", "Offers", Gift],
  ["/admin/prebookings", "Pre-bookings", ClipboardList],
  ["/admin/enquiries", "Enquiries", Mail],
  ["/admin/subscribers", "Subscribers", Users],
  ["/admin/settings", "Shop settings", Settings],
];

export function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const superAdminLinks = user?.role === "Super Admin" ? [["/admin/accounts", "Admin accounts", Shield], ["/admin/activity", "Activity log", Activity]] : [];
  const links = [...sharedLinks, ...superAdminLinks];
  const heading = links.find(([path]) => path === location.pathname)?.[1] || "Administration";

  async function signOut() {
    try { await logout(); } finally { navigate("/login", { replace: true }); }
  }

  return <div className="admin-shell">
    {menuOpen && <button className="admin-sidebar-scrim" type="button" aria-label="Close dashboard menu" onClick={() => setMenuOpen(false)} />}
    <aside className={`admin-sidebar${menuOpen ? " open" : ""}`}>
      <div className="admin-sidebar-brand"><span className="admin-brand-mark">TS</span><span><strong>Toy Shop</strong><small>Store management</small></span><button className="admin-sidebar-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
      <p className="admin-nav-label">WORKSPACE</p>
      <nav aria-label="Admin dashboard navigation">{links.map(([path, label, Icon, exact]) => <NavLink key={path} to={path} end={exact} onClick={() => setMenuOpen(false)}><Icon size={18} aria-hidden="true" /><span>{label}</span><ChevronRight className="admin-nav-chevron" size={16} /></NavLink>)}</nav>
      <div className="admin-sidebar-bottom"><div className="admin-profile"><span className="admin-avatar">{user?.fullName?.slice(0, 1)?.toUpperCase() || "A"}</span><span><strong>{user?.fullName}</strong><small>{user?.role}</small></span></div><Button variant="ghost" type="button" onClick={signOut}><LogOut size={18} /> Sign out</Button></div>
    </aside>
    <main className="admin-main"><header className="admin-topbar"><Button variant="ghost" className="admin-menu-toggle" type="button" aria-label="Open dashboard menu" onClick={() => setMenuOpen(true)}><Menu size={22} /></Button><div><p className="admin-breadcrumb">Toy Shop <ChevronRight size={14} /> Dashboard</p><h1>{heading}</h1></div><div className="admin-topbar-user"><span>{user?.username}</span><span className="admin-avatar">{user?.fullName?.slice(0, 1)?.toUpperCase() || "A"}</span></div></header><section className="admin-content"><Outlet /></section></main>
  </div>;
}
