create table if not exists public.game_room_memberships (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  player_id uuid not null,
  auth_user_id uuid references auth.users(id) on delete set null,
  role text not null check (role in ('host', 'cohost', 'participant')),
  is_manual boolean not null default false,
  joined_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (room_id, player_id)
);

create index if not exists game_room_memberships_user_idx
  on public.game_room_memberships(auth_user_id, last_active_at desc)
  where auth_user_id is not null;

create index if not exists game_room_memberships_room_idx
  on public.game_room_memberships(room_id);

alter table public.game_room_memberships enable row level security;

revoke all on public.game_room_memberships from public, anon, authenticated;

alter table public.game_rooms
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists last_active_at timestamptz not null default now(),
  add column if not exists replay_source_room_id uuid references public.game_rooms(id) on delete set null;

create index if not exists game_rooms_last_active_idx
  on public.game_rooms(last_active_at desc);

-- Preserve current hosts when upgrading existing rooms. Participant accounts
-- cannot be inferred safely from legacy JSON and are claimed from device tokens.
insert into public.game_room_memberships (room_id, player_id, auth_user_id, role, is_manual, joined_at, last_active_at)
select
  room.id,
  (player->>'id')::uuid,
  room.host_user_id,
  'host',
  false,
  room.created_at,
  coalesce(room.updated_at, room.created_at)
from public.game_rooms room
cross join lateral jsonb_array_elements(room.players) player
where player->>'isHost' = 'true'
on conflict (room_id, player_id) do update
set auth_user_id = coalesce(public.game_room_memberships.auth_user_id, excluded.auth_user_id),
    last_active_at = greatest(public.game_room_memberships.last_active_at, excluded.last_active_at);
