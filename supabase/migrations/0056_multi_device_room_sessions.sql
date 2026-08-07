alter table public.game_room_player_sessions
  drop constraint if exists game_room_player_sessions_pkey;

alter table public.game_room_player_sessions
  add column if not exists id uuid default gen_random_uuid();

update public.game_room_player_sessions
set id = gen_random_uuid()
where id is null;

alter table public.game_room_player_sessions
  alter column id set not null;

alter table public.game_room_player_sessions
  add constraint game_room_player_sessions_pkey primary key (id);

create index if not exists game_room_player_sessions_player_idx
  on public.game_room_player_sessions(room_id, player_id);
