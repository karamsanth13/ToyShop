-- Member 2 forward migration: support reversible Admin deactivation.
alter table public.admin_profiles
  add column is_active boolean not null default true;

create or replace function public.current_admin_role()
returns text language sql stable security definer set search_path = ''
as $function$
  select p.role from public.admin_profiles p
  where p.id = (select auth.uid()) and p.is_active
$function$;
