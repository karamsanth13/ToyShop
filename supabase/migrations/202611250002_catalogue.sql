create extension if not exists pgcrypto;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid references public.categories(id) on delete set null,
  price numeric(10,2) not null check (price >= 0),
  images text[] not null default '{}',
  description text,
  availability text not null default 'in_stock' check (availability in ('in_stock', 'out_of_stock')),
  is_published boolean not null default false,
  is_rare boolean not null default false,
  is_new boolean not null default false,
  is_recommended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_public_created_idx on public.products(created_at desc) where is_published;
create index products_public_availability_idx on public.products(availability) where is_published;
create index products_public_flags_idx on public.products(is_recommended, is_rare, is_new) where is_published;
create index categories_public_sort_idx on public.categories(sort_order, name) where is_published;

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy "Public reads published categories" on public.categories
  for select to anon, authenticated using (is_published);
create policy "Public reads published products" on public.products
  for select to anon, authenticated using (is_published);

-- Writes are denied by default until Member 2's role claim and shared RLS helper are agreed.
