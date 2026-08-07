import {
  NextResponse,
} from "next/server";

import {
  clearAccountSession,
} from "@/lib/auth/session";

export async function POST() {
  await clearAccountSession();
  return NextResponse.json({
    ok: true,
  });
}
