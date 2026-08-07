"use client";

import {
  Cloud,
  CloudOff,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import {
  useAccount,
} from "@/components/providers/account-provider";
import { loadOfflineQueue } from "@/lib/sync/offline-queue";
import { useEffect, useState } from "react";

export function SyncStatusControl() {
  const [
    pending,
    setPending,
  ] = useState(0);

  const {
    account,
    loading,
    syncStatus,
    lastSyncedAt,
    syncNow,
  } = useAccount();

  useEffect(() => {
    const refresh = () =>
      setPending(
        loadOfflineQueue().length,
      );
    refresh();
    window.addEventListener(
      "olfactus:sync-queue-updated",
      refresh,
    );
    return () =>
      window.removeEventListener(
        "olfactus:sync-queue-updated",
        refresh,
      );
  }, []);

  if (
    loading ||
    !account
  ) {
    return null;
  }

  const Icon =
    syncStatus ===
      "synced"
      ? Cloud
      : syncStatus ===
          "conflict" ||
        syncStatus ===
          "error"
        ? TriangleAlert
        : syncStatus ===
            "local-only"
          ? CloudOff
          : RefreshCcw;

  return (
    <button
      type="button"
      className={`sync-status sync-status-${syncStatus}`}
      onClick={() =>
        void syncNow()
      }
      title={
        lastSyncedAt
          ? `Last synced ${new Date(
              lastSyncedAt,
            ).toLocaleString()}`
          : "Synchronize account data"
      }
    >
      <Icon size={13} />
      {syncStatus ===
      "syncing"
        ? "Syncing"
        : syncStatus ===
            "synced"
          ? "Synced"
          : syncStatus ===
              "conflict"
            ? "Conflict"
            : syncStatus ===
                "error"
              ? "Sync error"
              : pending
                ? `${pending} pending`
                : "Sync now"}
    </button>
  );
}
