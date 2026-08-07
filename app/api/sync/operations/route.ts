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
  applySyncOperations,
} from "@/lib/server/operation-store";
import type {
  SyncOperation,
} from "@/lib/server/postgres/types";
import {
  checkRateLimit,
  requestIdentity,
} from "@/lib/security/rate-limit";

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

  const rate =
    checkRateLimit({
      key:
        `sync:${account.id}:${requestIdentity(
          request,
        )}`,
      limit: 60,
      windowMs:
        60_000,
    });

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many synchronization requests.",
      },
      {
        status: 429,
      },
    );
  }

  const body =
    (await request.json()) as {
      operations?:
        SyncOperation[];
    };
  const operations =
    Array.isArray(
      body.operations,
    )
      ? body.operations.slice(
          0,
          250,
        )
      : [];

  if (
    JSON.stringify(
      operations,
    ).length >
    1_500_000
  ) {
    return NextResponse.json(
      {
        error:
          "Synchronization payload is too large.",
      },
      {
        status: 413,
      },
    );
  }

  const result =
    await applySyncOperations(
      account.id,
      operations,
    );

  return NextResponse.json({
    accepted:
      result.accepted,
    conflicts:
      result.conflicts.map(
        ({
          operation,
          serverRecord,
        }) => ({
          id: randomUUID(),
          entityType:
            operation.entityType,
          entityId:
            operation.entityId,
          localOperation:
            operation,
          serverRecord,
          detectedAt:
            new Date().toISOString(),
        }),
      ),
  });
}
