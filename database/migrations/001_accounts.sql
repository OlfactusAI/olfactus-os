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
