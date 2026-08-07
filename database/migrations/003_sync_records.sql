create table if not exists sync_records (
  id uuid primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  device_id text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  unique(account_id, entity_type, entity_id)
);
create index if not exists sync_records_account_revision_idx
  on sync_records(account_id, revision);
