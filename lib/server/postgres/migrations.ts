import "server-only";

import {
  readFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";

export interface SqlExecutor {
  query(
    sql: string,
    parameters?: unknown[],
  ): Promise<unknown>;
}

export async function runDatabaseMigrations(
  executor: SqlExecutor,
) {
  await executor.query(`
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
    await executor.query(
      "select version from schema_migrations",
    ) as {
      rows?: Array<{
        version: string;
      }>;
    };
  const versions =
    new Set(
      applied.rows?.map(
        (row) =>
          row.version,
      ) ?? [],
    );

  for (const file of files) {
    const version =
      file.replace(
        /\.sql$/,
        "",
      );
    if (
      versions.has(version)
    ) {
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

    await executor.query(
      "begin",
    );
    try {
      await executor.query(sql);
      await executor.query(
        "insert into schema_migrations(version) values ($1)",
        [version],
      );
      await executor.query(
        "commit",
      );
    } catch (error) {
      await executor.query(
        "rollback",
      );
      throw error;
    }
  }

  return files;
}
