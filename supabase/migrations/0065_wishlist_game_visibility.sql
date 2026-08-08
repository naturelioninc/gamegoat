alter table public.profiles add column if not exists wishlist_game_visibility text not null default 'assigned_and_group'
  check (wishlist_game_visibility in ('private', 'assigned_only', 'assigned_and_group'));
