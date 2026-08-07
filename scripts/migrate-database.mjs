import {
  readFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "DATABASE_URL is required.",
  );
  process.exit(1);
}

let pg;
try {
  pg = await import("pg");
} catch {
  console.error(
    "Install the optional pg package before running PostgreSQL migrations.",
  );
  process.exit(1);
}

const client =
  new pg.Client({
    connectionString:
      databaseUrl,
  });

await client.connect();
await client.query(`
  create table if not exists schema_migrations (
    version text primary key,
    applied_at timestamptz not null default now()
  )
`);

const directory =
  path.join(
    process.cwd(),
    "database",
    "migrations",
  );
const files =
  (await readdir(directory))
    .filter(
      (file) =>
        file.endsWith(".sql"),
    )
    .sort();
const applied =
  await client.query(
    "select version from schema_migrations",
  );
const versions =
  new Set(
    applied.rows.map(
      (row) =>
        row.version,
    ),
  );

for (const file of files) {
  const version =
    file.replace(
      /\.sql$/,
      "",
    );
  if (versions.has(version)) {
    continue;
  }
  const sql =
    await readFile(
      path.join(
        directory,
        file,
      ),
      "utf8",
    );
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query(
      "insert into schema_migrations(version) values ($1)",
      [version],
    );
    await client.query("commit");
    console.log(
      `Applied ${version}`,
    );
  } catch (error) {
    await client.query(
      "rollback",
    );
    throw error;
  }
}

await client.end();
