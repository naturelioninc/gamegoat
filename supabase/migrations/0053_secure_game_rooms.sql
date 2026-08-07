begin;

drop policy if exists "game_rooms_insert" on public.game_rooms;
drop policy if exists "game_rooms_update" on public.game_rooms;

create or replace function public.join_game_room(
  _code text,
  _player_id uuid,
  _player_name text
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
  return new_player;
end;
$$;

revoke all on function public.join_game_room(text, uuid, text) from public, anon, authenticated;
grant execute on function public.join_game_room(text, uuid, text) to service_role;

commit;

