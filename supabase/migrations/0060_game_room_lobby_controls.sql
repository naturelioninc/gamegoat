alter table public.game_rooms
  add column if not exists lobby_locked boolean not null default false;

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
  if normalized_name = '' or char_length(normalized_name) > 30 then raise exception 'invalid player name'; end if;
  if _token_hash is null or char_length(_token_hash) <> 64 then raise exception 'invalid player token'; end if;

  select * into room from public.game_rooms
  where code = upper(_code) and expires_at > now()
  for update;

  if room.id is null then raise exception 'room not found or expired'; end if;
  if room.status <> 'lobby' then raise exception 'game already started'; end if;
  if room.lobby_locked then raise exception 'the host has closed joining'; end if;
  if jsonb_array_length(room.players) >= 50 then raise exception 'room is full'; end if;
  if exists (select 1 from jsonb_array_elements(room.players) p where lower(p->>'name') = lower(normalized_name)) then
    raise exception 'name already taken in this room';
  end if;

  new_player := jsonb_build_object('id', _player_id::text, 'name', normalized_name, 'isHost', false);
  update public.game_rooms set players = room.players || jsonb_build_array(new_player), last_active_at = now() where id = room.id;
  insert into public.game_room_player_sessions(room_id, player_id, token_hash) values (room.id, _player_id, _token_hash);
  return new_player;
end;
$$;

revoke all on function public.join_game_room(text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.join_game_room(text, uuid, text, text) to service_role;
