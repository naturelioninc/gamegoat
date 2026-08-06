create table if not exists exchanges (
  id uuid primary key default gen_random_uuid(),
  host_email text not null,
  host_name text not null,
  name text not null,
  party_date date,
  budget_cents int,
  rules jsonb not null default '{"maxSteals":3,"allowImmediateStealback":false,"firstPlayerFinalTurn":true}'::jsonb,
  status text not null default 'planning' check (status in ('planning','active','complete')),
  secret_santa_drawn boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table exchanges enable row level security;
create policy "open" on exchanges for all using (true) with check (true);
