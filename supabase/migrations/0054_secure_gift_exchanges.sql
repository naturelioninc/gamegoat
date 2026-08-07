alter table public.exchange_participants
  add column if not exists access_token_hash text;

create unique index if not exists exchange_participants_access_token_hash_idx
  on public.exchange_participants(access_token_hash)
  where access_token_hash is not null;

drop policy if exists "open" on public.gift_exchanges;
drop policy if exists "open" on public.exchange_participants;

comment on column public.exchange_participants.access_token_hash is
  'SHA-256 hash of the private capability token used to edit this participant wish list.';
