import {
  NextResponse,
} from "next/server";

import {
  readAccountSession,
} from "@/lib/auth/session";
import {
  createShare,
  listShares,
} from "@/lib/sharing/store";
import type {
  SharePrivacy,
  ShareType,
  ShareVisibility,
} from "@/lib/sharing/types";
import {
  checkRateLimit,
  requestIdentity,
} from "@/lib/security/rate-limit";

const defaultPrivacy:
  SharePrivacy = {
    hidePrices: true,
    hideWearHistory: true,
    hideAcquisitionDates: true,
    hidePrivateNotes: true,
    disableIndexing: true,
  };

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
    shares:
      await listShares(
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

  const rate =
    checkRateLimit({
      key:
        `shares:${account.id}:${requestIdentity(
          request,
        )}`,
      limit: 30,
      windowMs:
        60_000,
    });

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many share requests.",
      },
      {
        status: 429,
      },
    );
  }

  const body =
    (await request.json()) as {
      type?: ShareType;
      title?: string;
      visibility?:
        ShareVisibility;
      expiresAt?: string;
      privacy?:
        Partial<SharePrivacy>;
      payload?:
        Record<string, unknown>;
    };

  if (
    !body.type ||
    ![
      "collection",
      "simulation",
      "recommendation",
    ].includes(body.type)
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid share type.",
      },
      {
        status: 400,
      },
    );
  }

  const share =
    await createShare({
      accountId:
        account.id,
      type:
        body.type,
      title:
        body.title ??
        "Shared intelligence",
      visibility:
        body.visibility ??
        "unlisted",
      expiresAt:
        body.expiresAt,
      privacy: {
        ...defaultPrivacy,
        ...body.privacy,
      },
      payload:
        body.payload ?? {},
    });

  return NextResponse.json(
    {
      share,
    },
    {
      status: 201,
    },
  );
}
