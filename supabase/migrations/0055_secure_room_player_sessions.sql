create table if not exists public.game_room_player_sessions (
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  player_id uuid not null,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  primary key (room_id, player_id)
);

alter table public.game_room_player_sessions enable row level security;

create or replace function public.join_game_room(
  _code text,
  _player_id uuid,
  _player_name text,
  _token_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  room public.game_rooms;
  normalized_name text := trim(_player_name);
  new_player jsonb;
begin
  if normalized_name = '' or char_length(normalized_name) > 30 then
    raise exception 'invalid player name';
  end if;
  if _token_hash is null or char_length(_token_hash) <> 64 then
    raise exception 'invalid player token';
  end if;

  select * into room
  from public.game_rooms
  where code = upper(_code) and expires_at > now()
  for update;

  if room.id is null then raise exception 'room not found or expired'; end if;
  if room.status <> 'lobby' then raise exception 'game already started'; end if;
  if jsonb_array_length(room.players) >= 50 then raise exception 'room is full'; end if;
  if exists (
    select 1 from jsonb_array_elements(room.players) p
    where lower(p->>'name') = lower(normalized_name)
  ) then raise exception 'name already taken in this room'; end if;

  new_player := jsonb_build_object(
    'id', _player_id::text,
    'name', normalized_name,
    'isHost', false
  );
  update public.game_rooms
  set players = room.players || jsonb_build_array(new_player)
  where id = room.id;

  insert into public.game_room_player_sessions(room_id, player_id, token_hash)
  values (room.id, _player_id, _token_hash);

  return new_player;
end;
$$;

drop function if exists public.join_game_room(text, uuid, text);
revoke all on function public.join_game_room(text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.join_game_room(text, uuid, text, text) to service_role;
