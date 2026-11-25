create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offers_valid_window check (ends_at > starts_at)
);

create table public.offer_products (
  offer_id uuid not null references public.offers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (offer_id, product_id)
);

create index offers_public_dates_idx on public.offers(starts_at, ends_at) where is_published;
create index offer_products_product_idx on public.offer_products(product_id);

create trigger offers_updated_at before update on public.offers
  for each row execute function public.set_updated_at();

alter table public.offers enable row level security;
alter table public.offer_products enable row level security;

create policy "Public reads active published offers" on public.offers
  for select to anon, authenticated
  using (is_published and starts_at <= now() and ends_at > now());
create policy "Public reads products linked to active offers" on public.offer_products
  for select to anon, authenticated
  using (exists (
    select 1 from public.offers o
    where o.id = offer_id and o.is_published and o.starts_at <= now() and o.ends_at > now()
  ));

-- Writes are denied by default until Member 2's role claim and shared RLS helper are agreed.
