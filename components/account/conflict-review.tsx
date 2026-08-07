"use client";

import {
  Check,
  GitMerge,
  Server,
  Smartphone,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  loadSyncConflicts,
  resolveSyncConflict,
} from "@/lib/sync/conflicts";
import type {
  SyncConflict,
} from "@/lib/server/postgres/types";

export function ConflictReview() {
  const [
    conflicts,
    setConflicts,
  ] =
    useState<SyncConflict[]>(
      [],
    );

  useEffect(() => {
    const refresh = () =>
      setConflicts(
        loadSyncConflicts(),
      );
    refresh();
    window.addEventListener(
      "olfactus:sync-conflicts-updated",
      refresh,
    );
    return () =>
      window.removeEventListener(
        "olfactus:sync-conflicts-updated",
        refresh,
      );
  }, []);

  if (!conflicts.length) {
    return (
      <div className="conflict-empty">
        <Check size={16} />
        No field-level conflicts require review.
      </div>
    );
  }

  return (
    <div className="conflict-list">
      {conflicts.map(
        (conflict) => (
          <article
            key={
              conflict.id
            }
            className="conflict-card"
          >
            <div className="flex items-center gap-2">
              <GitMerge
                size={15}
              />
              <strong>
                {
                  conflict.entityType
                }{" "}
                conflict
              </strong>
            </div>
            <p>
              Record{" "}
              {
                conflict.entityId
              }{" "}
              changed on another device.
            </p>
            <div className="conflict-columns">
              <div>
                <span>
                  <Smartphone
                    size={12}
                  />
                  Local
                </span>
                <pre>
                  {JSON.stringify(
                    conflict
                      .localOperation
                      .payload,
                    null,
                    2,
                  )}
                </pre>
              </div>
              <div>
                <span>
                  <Server
                    size={12}
                  />
                  Server
                </span>
                <pre>
                  {JSON.stringify(
                    conflict
                      .serverRecord
                      .payload,
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setConflicts(
                    resolveSyncConflict(
                      conflict.id,
                    ),
                  )
                }
              >
                Mark reviewed
              </button>
            </div>
          </article>
        ),
      )}
    </div>
  );
}
