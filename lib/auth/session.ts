import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import {
  cookies,
} from "next/headers";

import type {
  PublicAccount,
  SessionPayload,
} from "@/lib/auth/types";
import {
  findAccountById,
} from "@/lib/server/store";

export const sessionCookieName =
  "olfactus_session";

function sessionSecret() {
  const secret =
    process.env
      .OLFACTUS_SESSION_SECRET;

  if (
    process.env.NODE_ENV ===
      "production" &&
    (!secret ||
      secret.length < 32)
  ) {
    throw new Error(
      "OLFACTUS_SESSION_SECRET must contain at least 32 characters in production.",
    );
  }

  return (
    secret ??
    "olfactus-local-development-session-secret-change-before-deployment"
  );
}

function sign(
  encodedPayload: string,
) {
  return createHmac(
    "sha256",
    sessionSecret(),
  )
    .update(encodedPayload)
    .digest("base64url");
}

export function encodeSession(
  payload: SessionPayload,
) {
  const encoded =
    Buffer.from(
      JSON.stringify(payload),
    ).toString("base64url");
  return `${encoded}.${sign(
    encoded,
  )}`;
}

export function decodeSession(
  value: string,
) {
  const [
    encoded,
    signature,
  ] = value.split(".");

  if (
    !encoded ||
    !signature
  ) {
    return null;
  }

  const expected =
    Buffer.from(
      sign(encoded),
    );
  const actual =
    Buffer.from(
      signature,
    );

  if (
    expected.length !==
      actual.length ||
    !timingSafeEqual(
      expected,
      actual,
    )
  ) {
    return null;
  }

  try {
    const payload =
      JSON.parse(
        Buffer.from(
          encoded,
          "base64url",
        ).toString("utf8"),
      ) as SessionPayload;

    if (
      payload.expiresAt <
      Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function setAccountSession(
  account: PublicAccount,
) {
  const now =
    Date.now();
  const payload:
    SessionPayload = {
      accountId:
        account.id,
      email:
        account.email,
      displayName:
        account.displayName,
      issuedAt: now,
      expiresAt:
        now +
        1000 *
          60 *
          60 *
          24 *
          30,
    };
  const store =
    await cookies();

  store.set(
    sessionCookieName,
    encodeSession(payload),
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      maxAge:
        60 *
        60 *
        24 *
        30,
    },
  );
}

export async function clearAccountSession() {
  const store =
    await cookies();
  store.delete(
    sessionCookieName,
  );
}

export async function readAccountSession() {
  const store =
    await cookies();
  const value =
    store.get(
      sessionCookieName,
    )?.value;

  if (!value) {
    return null;
  }

  const payload =
    decodeSession(value);
  if (!payload) {
    return null;
  }

  const account =
    await findAccountById(
      payload.accountId,
    );

  if (!account) {
    return null;
  }

  return {
    id: account.id,
    email:
      account.email,
    displayName:
      account.displayName,
    createdAt:
      account.createdAt,
  } satisfies PublicAccount;
}
