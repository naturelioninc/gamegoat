-- Game rooms for multiplayer Kris Kringle and Secret Santa
-- Players join via a 6-char code; no auth required to play.

create table if not exists game_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default '',
  game_type text not null default 'kris_kringle' check (game_type in ('kris_kringle', 'secret_santa')),
  host_user_id uuid references auth.users(id) on delete set null,
  rules jsonb not null default '{"maxSteals":3,"allowImmediateStealback":false,"firstPlayerFinalTurn":true}',
  players jsonb not null default '[]',
  state jsonb,
  status text not null default 'lobby' check (status in ('lobby', 'active', 'complete', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

-- Room code generator: 6 chars, no 0/O/I/1 to avoid confusion
create or replace function generate_room_code() returns text language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  generated_code text := '';
  attempts int := 0;
begin
  loop
    generated_code := '';
    for i in 1..6 loop
      generated_code := generated_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    attempts := attempts + 1;
    exit when not exists (select 1 from game_rooms where game_rooms.code = generated_code);
    if attempts > 20 then raise exception 'Could not generate unique room code'; end if;
  end loop;
  return generated_code;
end;
$$;

create or replace function set_room_code_and_updated()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' and (new.code is null or new.code = '') then
    new.code := generate_room_code();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger game_rooms_before_upsert
  before insert or update on game_rooms
  for each row execute function set_room_code_and_updated();

-- RLS: open read/write for now — game logic enforced at app level
alter table game_rooms enable row level security;

create policy "game_rooms_select" on game_rooms for select using (true);
create policy "game_rooms_insert" on game_rooms for insert with check (true);
create policy "game_rooms_update" on game_rooms for update using (true);

-- Enable Realtime for live board sync
alter publication supabase_realtime add table game_rooms;

-- Auto-expire abandoned rooms (cleaned up by a cron or on-read)
create index if not exists game_rooms_expires_at on game_rooms (expires_at);
create index if not exists game_rooms_code on game_rooms (code);
