import { getPublicShopData } from "@/features/shop/data";

export async function ShopFooter() {
  const { shop, socialLinks } = await getPublicShopData();
  const mapQuery = shop?.map_location?.trim() || shop?.address?.trim();
  return (
    <footer className="shop-footer">
      <div className="page-container shop-footer-grid">
        <section>
          <h2>{shop?.name?.trim() || "Toy Shop"}</h2>
          {shop?.description ? <p>{shop.description}</p> : <p>Find a little something for every kind of play.</p>}
        </section>
        <section aria-labelledby="footer-contact-heading">
          <h3 id="footer-contact-heading">Contact</h3>
          {shop?.address ? <p>{shop.address}</p> : null}
          {shop?.phone ? <p><a href={`tel:${shop.phone}`}>{shop.phone}</a></p> : null}
          {shop?.email ? <p><a href={`mailto:${shop.email}`}>{shop.email}</a></p> : null}
          {!shop?.address && !shop?.phone && !shop?.email ? <p>Shop contact details will appear here when available.</p> : null}
        </section>
        <section aria-labelledby="footer-social-heading">
          <h3 id="footer-social-heading">Follow along</h3>
          {socialLinks.length ? <ul className="shop-social-links">{socialLinks.map((link) => <li key={link.id}><a href={link.url} target="_blank" rel="noreferrer">{link.label || link.platform}</a></li>)}</ul> : <p>Social links will appear here when available.</p>}
        </section>
        <section aria-labelledby="footer-location-heading">
          <h3 id="footer-location-heading">Find us</h3>
          {mapQuery ? <iframe title="Shop location map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} /> : <p>Location details have not been added yet.</p>}
        </section>
      </div>
      <div className="page-container shop-footer-bottom">Visit us in person to find your next favorite toy.</div>
    </footer>
  );
}
