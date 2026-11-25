import Link from "next/link";
import { Suspense } from "react";
import { PageContainer, SectionHeading } from "@/components/ui";
import { CatalogueSearch } from "@/features/catalogue/components/catalogue-search";
import { ProductGrid } from "@/features/catalogue/components/product-grid";
import { listActiveOffers, listCategories, listProducts } from "@/features/catalogue/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const client = await createSupabaseServerClient();
  const [products, categories, offers, recommended, rare, newItems] = client
    ? await Promise.all([
      listProducts(client, { q, limit: 24 }), listCategories(client), listActiveOffers(client),
      listProducts(client, { limit: 8, flag: "is_recommended" }),
      listProducts(client, { limit: 8, flag: "is_rare" }),
      listProducts(client, { limit: 8, flag: "is_new" }),
    ])
    : [[], [], [], [], [], []];
  return <main className="min-h-screen pb-16">
    <section className="bg-surface py-10 sm:py-16"><PageContainer>
      <p className="mb-2 font-bold text-coral">A little wonder for every day</p>
      <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl">Find your next favourite toy.</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">Explore our shelves, discover something new, then visit us in store.</p>
      <div className="mt-7"><Suspense fallback={<div className="h-11 w-full max-w-xl rounded-xl bg-page" />}><CatalogueSearch /></Suspense></div>
    </PageContainer></section>
    <PageContainer className="space-y-12 pt-10">
      {offers.length > 0 && <section><SectionHeading title="Special offers" description="A few lovely finds available for a limited time."/><div className="grid gap-4 sm:grid-cols-2">{offers.map((offer) => <article key={offer.id} className="rounded-3xl bg-yellow/30 p-6"><h3 className="text-xl font-extrabold">{offer.title}</h3>{offer.description && <p className="mt-2 text-muted">{offer.description}</p>}<div className="mt-4 flex flex-wrap gap-3">{offer.products.map((product) => <Link className="font-bold text-blue underline" key={product.id} href={`/products/${product.slug}`}>{product.name}</Link>)}</div></article>)}</div></section>}
      {categories.length > 0 && <section><SectionHeading title="Browse by category"/><div className="flex flex-wrap gap-3">{categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="min-h-11 rounded-full border border-line bg-surface px-5 py-2.5 font-bold hover:border-coral">{category.name}</Link>)}</div></section>}
      <section><SectionHeading title={q ? `Search results for “${q}”` : "Explore our toys"} description="Out-of-stock favourites stay here so you can still discover them."/><ProductGrid products={products} /></section>
      {recommended.length > 0 && <section><SectionHeading title="Shop favourites" description="Picked by the shop team."/><ProductGrid products={recommended} /></section>}
      {rare.length > 0 && <section><SectionHeading title="Rare finds" description="Special pieces selected by the shop team."/><ProductGrid products={rare} /></section>}
      {newItems.length > 0 && <section><SectionHeading title="New arrivals" description="Fresh finds picked by the shop team."/><ProductGrid products={newItems} /></section>}
    </PageContainer>
  </main>;
}
