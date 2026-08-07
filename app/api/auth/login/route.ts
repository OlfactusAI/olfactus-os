import {
  NextResponse,
} from "next/server";

import {
  verifyPassword,
} from "@/lib/auth/password";
import {
  setAccountSession,
} from "@/lib/auth/session";
import {
  normalizeEmail,
} from "@/lib/auth/validation";
import {
  findAccountByEmail,
} from "@/lib/server/store";

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as {
        email?: string;
        password?: string;
      };
    const email =
      normalizeEmail(
        body.email ?? "",
      );
    const account =
      await findAccountByEmail(
        email,
      );

    if (
      !account ||
      !verifyPassword(
        body.password ?? "",
        account.passwordSalt,
        account.passwordHash,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Email or password is incorrect.",
        },
        {
          status: 401,
        },
      );
    }

    await setAccountSession({
      id: account.id,
      email:
        account.email,
      displayName:
        account.displayName,
      createdAt:
        account.createdAt,
    });

    return NextResponse.json({
      account: {
        id: account.id,
        email:
          account.email,
        displayName:
          account.displayName,
        createdAt:
          account.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to sign in.",
      },
      {
        status: 400,
      },
    );
  }
}
