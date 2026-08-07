import {
  randomUUID,
} from "node:crypto";
import {
  NextResponse,
} from "next/server";

import {
  readAccountSession,
} from "@/lib/auth/session";
import {
  createRestorePoint,
  listRestorePoints,
} from "@/lib/server/operation-store";
import type {
  BackupRecord,
} from "@/lib/server/postgres/types";

export async function GET() {
  const account =
    await readAccountSession();

  if (!account) {
    return NextResponse.json(
      {
        error:
          "Authentication required.",
      },
      {
        status: 401,
      },
    );
  }

  return NextResponse.json({
    backups:
      await listRestorePoints(
        account.id,
      ),
  });
}

export async function POST(
  request: Request,
) {
  const account =
    await readAccountSession();

  if (!account) {
    return NextResponse.json(
      {
        error:
          "Authentication required.",
      },
      {
        status: 401,
      },
    );
  }

  const body =
    (await request.json()) as {
      reason?:
        BackupRecord["reason"];
      revision?: number;
      payload?:
        Record<string, string>;
    };
  const backup:
    BackupRecord = {
      id:
        randomUUID(),
      accountId:
        account.id,
      reason:
        body.reason ??
        "manual",
      createdAt:
        new Date().toISOString(),
      revision:
        body.revision ??
        0,
      payload:
        body.payload ?? {},
    };

  return NextResponse.json({
    backup:
      await createRestorePoint(
        backup,
      ),
  });
}
