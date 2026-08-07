import {
  NextResponse,
} from "next/server";

import {
  readAccountSession,
} from "@/lib/auth/session";
import {
  readUserSnapshot,
  writeUserSnapshot,
} from "@/lib/server/store";
import type {
  UserDataSnapshot,
} from "@/lib/sync/types";

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

  const snapshot =
    await readUserSnapshot(
      account.id,
    );

  return NextResponse.json({
    snapshot,
  });
}

export async function PUT(
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
      snapshot?:
        UserDataSnapshot;
      baseRevision?: number;
      force?: boolean;
    };

  if (
    !body.snapshot ||
    body.snapshot.schemaVersion !==
      1 ||
    typeof body.snapshot.data !==
      "object"
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid sync snapshot.",
      },
      {
        status: 400,
      },
    );
  }

  const current =
    await readUserSnapshot(
      account.id,
    );
  const currentRevision =
    current?.revision ?? 0;
  const baseRevision =
    body.baseRevision ?? 0;

  if (
    current &&
    currentRevision !==
      baseRevision &&
    !body.force
  ) {
    return NextResponse.json(
      {
        status:
          "conflict",
        serverSnapshot:
          current,
        acceptedRevision:
          currentRevision,
      },
      {
        status: 409,
      },
    );
  }

  const accepted:
    UserDataSnapshot = {
      ...body.snapshot,
      revision:
        currentRevision + 1,
      updatedAt:
        new Date().toISOString(),
    };

  await writeUserSnapshot(
    account.id,
    accepted,
  );

  return NextResponse.json({
    status: "synced",
    serverSnapshot:
      accepted,
    acceptedRevision:
      accepted.revision,
  });
}
