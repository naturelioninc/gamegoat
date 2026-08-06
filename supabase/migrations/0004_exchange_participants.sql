create table if not exists exchange_participants (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references exchanges(id) on delete cascade,
  name text not null,
  email text not null,
  wish_list jsonb not null default '[]'::jsonb,
  secret_santa_for uuid references exchange_participants(id),
  joined_at timestamptz not null default now(),
  unique(exchange_id, email),
  unique(exchange_id, name)
);
alter table exchange_participants enable row level security;
create policy "open" on exchange_participants for all using (true) with check (true);
