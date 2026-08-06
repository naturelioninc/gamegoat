alter table gift_exchanges add column if not exists user_id uuid references auth.users(id);
create index if not exists gift_exchanges_user_id_idx on gift_exchanges(user_id);
