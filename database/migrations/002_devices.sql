create table if not exists devices (
  id text primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  user_agent text,
  created_at timestamptz not null,
  last_seen_at timestamptz not null,
  revoked_at timestamptz
);
