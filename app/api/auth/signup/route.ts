import {
  randomUUID,
} from "node:crypto";
import {
  NextResponse,
} from "next/server";

import {
  createPasswordRecord,
} from "@/lib/auth/password";
import {
  setAccountSession,
} from "@/lib/auth/session";
import {
  normalizeDisplayName,
  normalizeEmail,
} from "@/lib/auth/validation";
import {
  createAccount,
  findAccountByEmail,
} from "@/lib/server/store";

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as {
        email?: string;
        displayName?: string;
        password?: string;
      };
    const email =
      normalizeEmail(
        body.email ?? "",
      );
    const displayName =
      normalizeDisplayName(
        body.displayName ??
          "",
      );

    if (
      await findAccountByEmail(
        email,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const password =
      createPasswordRecord(
        body.password ?? "",
      );
    const now =
      new Date().toISOString();
    const account = {
      id: randomUUID(),
      email,
      displayName,
      passwordSalt:
        password.salt,
      passwordHash:
        password.hash,
      createdAt: now,
      updatedAt: now,
    };

    await createAccount(
      account,
    );
    await setAccountSession({
      id: account.id,
      email:
        account.email,
      displayName:
        account.displayName,
      createdAt:
        account.createdAt,
    });

    return NextResponse.json(
      {
        account: {
          id: account.id,
          email:
            account.email,
          displayName:
            account.displayName,
          createdAt:
            account.createdAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create account.",
      },
      {
        status: 400,
      },
    );
  }
}
