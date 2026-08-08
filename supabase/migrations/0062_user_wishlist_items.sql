create table if not exists public.user_wishlist_items (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  item_text text not null check (char_length(trim(item_text)) between 1 and 240),
  item_url text check (item_url is null or char_length(item_url) <= 1000),
  notes text check (notes is null or char_length(notes) <= 500),
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_wishlist_items_user_idx on public.user_wishlist_items(auth_user_id, created_at desc);
drop trigger if exists user_wishlist_items_set_updated_at on public.user_wishlist_items;
create trigger user_wishlist_items_set_updated_at before update on public.user_wishlist_items for each row execute function public.set_updated_at();
alter table public.user_wishlist_items enable row level security;
create policy user_wishlist_items_self_select on public.user_wishlist_items for select using (auth_user_id = auth.uid());
create policy user_wishlist_items_self_insert on public.user_wishlist_items for insert with check (auth_user_id = auth.uid());
create policy user_wishlist_items_self_update on public.user_wishlist_items for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy user_wishlist_items_self_delete on public.user_wishlist_items for delete using (auth_user_id = auth.uid());
