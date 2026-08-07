import {
  NextResponse,
} from "next/server";

import {
  readAccountSession,
} from "@/lib/auth/session";
import {
  regenerateShareToken,
  revokeShare,
} from "@/lib/sharing/store";

export async function DELETE(
  _request: Request,
  context: {
    params:
      Promise<{
        token: string;
      }>;
  },
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

  const {
    token,
  } =
    await context.params;

  return NextResponse.json({
    revoked:
      await revokeShare(
        account.id,
        token,
      ),
  });
}

export async function PATCH(
  _request: Request,
  context: {
    params:
      Promise<{
        token: string;
      }>;
  },
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

  const {
    token,
  } =
    await context.params;

  return NextResponse.json({
    share:
      await regenerateShareToken(
        account.id,
        token,
      ),
  });
}
