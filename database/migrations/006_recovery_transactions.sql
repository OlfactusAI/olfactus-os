create table if not exists recovery_transactions (
  id uuid primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  title text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  device_id text not null,
  created_at timestamptz not null
);
