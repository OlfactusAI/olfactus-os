import Link from "next/link";
import {
  Eye,
  ShieldCheck,
} from "lucide-react";

import type {
  PublicShareRecord,
} from "@/lib/sharing/types";

export function PublicShareShell({
  share,
  children,
}: {
  share:
    PublicShareRecord;
  children:
    React.ReactNode;
}) {
  return (
    <main className="public-share-shell">
      <header className="public-share-header">
        <div>
          <p className="layer3-kicker">
            OLFACTUS Shared Intelligence
          </p>
          <h1 className="display-serif">
            {share.title}
          </h1>
        </div>
        <div className="public-share-meta">
          <span>
            <Eye size={13} />
            {
              share.viewCount
            }{" "}
            views
          </span>
          <span>
            <ShieldCheck
              size={13}
            />
            Privacy filtered
          </span>
        </div>
      </header>

      {children}

      <footer className="public-share-footer">
        <span>
          Powered by OLFACTUS
        </span>
        <Link href="/signup">
          Build your own collection intelligence
        </Link>
      </footer>
    </main>
  );
}
