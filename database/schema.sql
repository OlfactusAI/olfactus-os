-- PostgreSQL production target for OLFACTUS beta.
create table if not exists accounts (
  id uuid primary key,
  email text unique not null,
  display_name text not null,
  password_salt text not null,
  password_hash text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists user_snapshots (
  account_id uuid primary key references accounts(id) on delete cascade,
  revision bigint not null default 0,
  updated_at timestamptz not null,
  device_id text not null,
  payload jsonb not null
);

create index if not exists accounts_email_active_idx
  on accounts (lower(email))
  where deleted_at is null;
