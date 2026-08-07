import {
  NextResponse,
} from "next/server";

import {
  readAccountSession,
} from "@/lib/auth/session";
import {
  listAccountDevices,
  registerDevice,
  revokeDevice,
} from "@/lib/server/operation-store";
import type {
  DeviceRecord,
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
    devices:
      await listAccountDevices(
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
      id?: string;
      name?: string;
    };
  const now =
    new Date().toISOString();
  const device:
    DeviceRecord = {
      id:
        body.id ??
        crypto.randomUUID(),
      accountId:
        account.id,
      name:
        body.name?.trim() ||
        "Unnamed device",
      userAgent:
        request.headers.get(
          "user-agent",
        ) ?? undefined,
      createdAt: now,
      lastSeenAt: now,
    };

  return NextResponse.json({
    device:
      await registerDevice(
        device,
      ),
  });
}

export async function DELETE(
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

  const url =
    new URL(
      request.url,
    );
  const deviceId =
    url.searchParams.get(
      "deviceId",
    );

  if (!deviceId) {
    return NextResponse.json(
      {
        error:
          "deviceId is required.",
      },
      {
        status: 400,
      },
    );
  }

  return NextResponse.json({
    revoked:
      await revokeDevice(
        account.id,
        deviceId,
      ),
  });
}
