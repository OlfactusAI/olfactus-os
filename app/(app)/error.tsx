"use client";

import Link from "next/link";
import { AlertTriangle, Copy, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("olfactus.runtime-errors.v1");
      const errors = raw ? JSON.parse(raw) : [];
      window.localStorage.setItem(
        "olfactus.runtime-errors.v1",
        JSON.stringify([
          {
            message: error.message,
            digest: error.digest,
            timestamp: new Date().toISOString(),
            path: window.location.pathname,
          },
          ...errors,
        ].slice(0, 25)),
      );
    } catch {}
  }, [error]);

  async function copy() {
    await navigator.clipboard.writeText(
      `OLFACTUS runtime error\n${error.message}\nDigest: ${error.digest ?? "none"}\nPath: ${window.location.pathname}`,
    );
    setCopied(true);
  }

  return (
    <main className="error-recovery-shell">
      <AlertTriangle size={36} />
      <p className="layer3-kicker">Runtime Recovery</p>
      <h1 className="display-serif">This intelligence module encountered a problem.</h1>
      <p>{error.message}</p>
      <div>
        <button onClick={reset}><RefreshCcw size={14} /> Retry module</button>
        <Link href="/today">Return to Today</Link>
        <button onClick={copy}><Copy size={14} /> {copied ? "Copied" : "Copy diagnostic details"}</button>
      </div>
    </main>
  );
}
