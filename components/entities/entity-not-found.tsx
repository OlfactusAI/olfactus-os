"use client";

import Link from "next/link";
import {
  Database,
  Search,
} from "lucide-react";

export function EntityNotFound({
  type,
  identifier,
}: {
  type: string;
  identifier: string;
}) {
  return (
    <main className="entity-not-found-shell">
      <Database
        size={32}
      />
      <p className="layer3-kicker">
        Dynamic Entity Platform
      </p>
      <h1 className="display-serif">
        This entity is not active in the current catalog.
      </h1>
      <p>
        OLFACTUS resolved the route correctly, but no{" "}
        <strong>
          {type}
        </strong>{" "}
        currently matches{" "}
        <code>
          {identifier}
        </code>
        . Imported records will become available here automatically after activation.
      </p>
      <div>
        <Link href="/entities">
          <Search
            size={14}
          />
          Browse active entities
        </Link>
        <Link href="/import">
          Import a record
        </Link>
      </div>
    </main>
  );
}
