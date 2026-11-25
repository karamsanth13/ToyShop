-- Member 2 foundation: roles, public shop identity, social links, login throttling.
-- Coordinate this sequence with Member 1 before applying any migration.
create table public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text not null,
  role text not null check (role in ('Admin', 'Super Admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $function$
begin
  new.updated_at = now();
  return new;
end
$function$;
create trigger admin_profiles_set_updated_at before update on public.admin_profiles
  for each row execute function public.set_updated_at();

create or replace function public.current_admin_role()
returns text language sql stable security definer set search_path = ''
as $function$
  select p.role from public.admin_profiles p where p.id = (select auth.uid())
$function$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $function$ select coalesce(public.current_admin_role() in ('Admin', 'Super Admin'), false) $function$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = ''
as $function$ select coalesce(public.current_admin_role() = 'Super Admin', false) $function$;

revoke all on function public.current_admin_role() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_super_admin() from public;
grant execute on function public.current_admin_role() to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_super_admin() to authenticated;

alter table public.admin_profiles enable row level security;
revoke all on public.admin_profiles from anon, authenticated;
grant select on public.admin_profiles to authenticated;
create policy "Admins read own profile; Super Admins may review profiles"
  on public.admin_profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_super_admin());
-- Profile creation and role changes are service-role-only server operations.

create table public.shop_details (
  id smallint primary key default 1 check (id = 1),
  name text check (name is null or char_length(name) <= 160),
  description text check (description is null or char_length(description) <= 2000),
  logo_path text check (logo_path is null or logo_path ~ '^logo/[A-Za-z0-9._-]+$'),
  address text check (address is null or char_length(address) <= 500),
  map_location text,
  phone text check (phone is null or char_length(phone) <= 40),
  whatsapp_number text check (whatsapp_number is null or char_length(whatsapp_number) <= 40),
  email text check (email is null or char_length(email) <= 254),
  updated_at timestamptz not null default now()
);
insert into public.shop_details (id) values (1);
create trigger shop_details_set_updated_at before update on public.shop_details
  for each row execute function public.set_updated_at();
alter table public.shop_details enable row level security;
grant select on public.shop_details to anon, authenticated;
grant update on public.shop_details to authenticated;
create policy "Public may read shop details" on public.shop_details
  for select to anon, authenticated using (true);
create policy "Admins may update shop details" on public.shop_details
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-assets', 'shop-assets', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "Public may read shop logo assets" on storage.objects
  for select to anon, authenticated using (bucket_id = 'shop-assets');
create policy "Admins may upload shop logo assets" on storage.objects
  for insert to authenticated with check (bucket_id = 'shop-assets' and (storage.foldername(name))[1] = 'logo' and public.is_admin());
create policy "Admins may update shop logo assets" on storage.objects
  for update to authenticated using (bucket_id = 'shop-assets' and (storage.foldername(name))[1] = 'logo' and public.is_admin())
  with check (bucket_id = 'shop-assets' and (storage.foldername(name))[1] = 'logo' and public.is_admin());
create policy "Admins may delete shop logo assets" on storage.objects
  for delete to authenticated using (bucket_id = 'shop-assets' and (storage.foldername(name))[1] = 'logo' and public.is_admin());

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('Instagram', 'Facebook', 'YouTube', 'TikTok', 'Other')),
  url text not null check (char_length(url) <= 2048 and url ~ '^https://'),
  label text check (label is null or char_length(label) <= 80),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger social_links_set_updated_at before update on public.social_links
  for each row execute function public.set_updated_at();
create index social_links_sort_order_idx on public.social_links (sort_order, platform);
alter table public.social_links enable row level security;
grant select on public.social_links to anon, authenticated;
grant insert, update, delete on public.social_links to authenticated;
create policy "Public may read social links" on public.social_links
  for select to anon, authenticated using (true);
create policy "Admins may add social links" on public.social_links
  for insert to authenticated with check (public.is_admin());
create policy "Admins may update social links" on public.social_links
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins may remove social links" on public.social_links
  for delete to authenticated using (public.is_admin());

-- Store only a server-keyed hash of proxy-provided client IP; never the raw address.
create table public.login_rate_limits (
  bucket_hash text primary key check (char_length(bucket_hash) = 64),
  failures smallint not null default 0 check (failures >= 0),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.login_rate_limits enable row level security;
revoke all on public.login_rate_limits from anon, authenticated;

create or replace function public.login_bucket_is_limited(p_bucket_hash text)
returns boolean language sql security definer set search_path = ''
as $function$
  select exists (
    select 1 from public.login_rate_limits r
    where r.bucket_hash = p_bucket_hash
      and (r.locked_until > now() or (r.failures >= 5 and r.window_started_at > now() - interval '15 minutes'))
  )
$function$;

create or replace function public.record_login_failure(p_bucket_hash text)
returns void language plpgsql security definer set search_path = ''
as $function$
begin
  insert into public.login_rate_limits (bucket_hash, failures) values (p_bucket_hash, 1)
  on conflict (bucket_hash) do update
  set failures = case when public.login_rate_limits.window_started_at <= now() - interval '15 minutes'
                      then 1 else public.login_rate_limits.failures + 1 end,
      window_started_at = case when public.login_rate_limits.window_started_at <= now() - interval '15 minutes'
                               then now() else public.login_rate_limits.window_started_at end,
      locked_until = case
        when public.login_rate_limits.window_started_at <= now() - interval '15 minutes' then null
        when public.login_rate_limits.failures + 1 >= 5 then now() + interval '15 minutes'
        else public.login_rate_limits.locked_until end,
      updated_at = now();
end
$function$;

create or replace function public.clear_login_failures(p_bucket_hash text)
returns void language sql security definer set search_path = ''
as $function$ delete from public.login_rate_limits where bucket_hash = p_bucket_hash $function$;

revoke all on function public.login_bucket_is_limited(text) from public, anon, authenticated;
revoke all on function public.record_login_failure(text) from public, anon, authenticated;
revoke all on function public.clear_login_failures(text) from public, anon, authenticated;
grant execute on function public.login_bucket_is_limited(text) to service_role;
grant execute on function public.record_login_failure(text) to service_role;
grant execute on function public.clear_login_failures(text) to service_role;
