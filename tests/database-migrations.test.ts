import {
  describe,
  expect,
  it,
} from "vitest";
import {
  readdirSync,
} from "node:fs";
import {
  join,
} from "node:path";

describe("Production database migrations", () => {
  it("contains the ordered beta.2 migration set", () => {
    const files =
      readdirSync(
        join(
          process.cwd(),
          "database",
          "migrations",
        ),
      )
        .filter(
          (file) =>
            file.endsWith(".sql"),
        )
        .sort();

    expect(files).toEqual([
      "001_accounts.sql",
      "002_devices.sql",
      "003_sync_records.sql",
      "004_timeline_events.sql",
      "005_simulator_scenarios.sql",
      "006_recovery_transactions.sql",
      "007_backup_snapshots.sql",
    ]);
  });
});
