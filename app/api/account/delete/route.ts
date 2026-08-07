import {
  NextResponse,
} from "next/server";

import {
  clearAccountSession,
  readAccountSession,
} from "@/lib/auth/session";
import {
  deleteAccount,
} from "@/lib/server/store";

export async function DELETE() {
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

  await deleteAccount(
    account.id,
  );
  await clearAccountSession();

  return NextResponse.json({
    deleted: true,
  });
}
