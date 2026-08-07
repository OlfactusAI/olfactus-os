create table if not exists backup_snapshots (
  id uuid primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  reason text not null,
  revision bigint not null,
  payload jsonb not null,
  created_at timestamptz not null
);
create index if not exists backup_snapshots_account_created_idx
  on backup_snapshots(account_id, created_at desc);
