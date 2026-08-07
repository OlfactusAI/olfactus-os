import {
  NextResponse,
} from "next/server";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

export async function GET() {
  const started =
    performance.now();
  const databaseMode =
    process.env.DATABASE_URL
      ? "postgresql-target"
      : "single-server-json";
  const latencyMs =
    Math.round(
      (
        performance.now() -
        started
      ) * 100,
    ) / 100;

  return NextResponse.json({
    status: "ok",
    version:
      olfactusSystemManifest.version,
    release:
      olfactusSystemManifest.release,
    databaseMode,
    migrationVersion:
      "007_backup_snapshots",
    apiLatencyMs:
      latencyMs,
    timestamp:
      new Date().toISOString(),
  });
}
