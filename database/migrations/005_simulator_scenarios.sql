create table if not exists simulator_scenarios (
  id uuid primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  device_id text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);
