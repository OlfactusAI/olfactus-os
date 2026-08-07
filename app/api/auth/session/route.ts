import {
  NextResponse,
} from "next/server";

import {
  readAccountSession,
} from "@/lib/auth/session";

export async function GET() {
  const account =
    await readAccountSession();

  return NextResponse.json({
    account,
  });
}
