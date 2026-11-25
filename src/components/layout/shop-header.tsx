import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getLogoUrl, getPublicShopData } from "@/features/shop/data";

export async function ShopHeader() {
  const { shop } = await getPublicShopData();
  const logo = getLogoUrl(shop?.logo_path ?? null);
  const name = shop?.name?.trim() || "Toy Shop";
  return (
    <header className="shop-header">
      <div className="page-container shop-header-inner">
        <Link href="/" className="shop-brand" aria-label={`${name} home`}>
          {logo ? <Image src={logo} alt="" width={40} height={40} unoptimized className="shop-logo" /> : <span className="shop-logo-placeholder" aria-hidden="true">TS</span>}
          <span>{name}</span>
        </Link>
        <nav className="shop-nav" aria-label="Main navigation">
          <Link href="/wishlist" aria-label="Open wishlist"><Heart size={20} aria-hidden="true" /><span className="sr-only">Wishlist</span></Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
