import "server-only";

import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export function createPasswordRecord(
  password: string,
) {
  validatePassword(password);
  const salt =
    randomBytes(16).toString(
      "hex",
    );
  const hash =
    scryptSync(
      password,
      salt,
      64,
    ).toString("hex");

  return {
    salt,
    hash,
  };
}

export function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
) {
  const actual =
    scryptSync(
      password,
      salt,
      64,
    );
  const expected =
    Buffer.from(
      expectedHash,
      "hex",
    );

  return (
    actual.length ===
      expected.length &&
    timingSafeEqual(
      actual,
      expected,
    )
  );
}

export function validatePassword(
  password: string,
) {
  if (password.length < 10) {
    throw new Error(
      "Password must be at least 10 characters.",
    );
  }
}
