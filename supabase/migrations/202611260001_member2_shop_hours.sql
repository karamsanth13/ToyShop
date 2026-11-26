-- Member 2 forward migration: opening hours for the public shop profile.
alter table public.shop_details
  add column opening_hours text
  check (opening_hours is null or char_length(opening_hours) <= 1000);
