"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  PublicAccount,
} from "@/lib/auth/types";
import {
  applyServerSnapshot,
  fetchServerSnapshot,
  getLastSyncedAt,
  pushLocalSnapshot,
} from "@/lib/sync/client";
import type {
  SyncStatus,
  UserDataSnapshot,
} from "@/lib/sync/types";

interface AccountContextValue {
  account:
    | PublicAccount
    | null;
  loading: boolean;
  syncStatus:
    SyncStatus;
  lastSyncedAt:
    string | null;
  conflict:
    UserDataSnapshot | null;
  refreshSession: () =>
    Promise<void>;
  syncNow: () =>
    Promise<void>;
  uploadLocalData: () =>
    Promise<void>;
  useServerData: () =>
    Promise<void>;
  signOut: () =>
    Promise<void>;
}

const AccountContext =
  createContext<AccountContextValue | null>(
    null,
  );

export function AccountProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const [
    account,
    setAccount,
  ] =
    useState<PublicAccount | null>(
      null,
    );
  const [
    loading,
    setLoading,
  ] = useState(true);
  const [
    syncStatus,
    setSyncStatus,
  ] =
    useState<SyncStatus>(
      "local-only",
    );
  const [
    lastSyncedAt,
    setLastSyncedAt,
  ] =
    useState<string | null>(
      null,
    );
  const [
    conflict,
    setConflict,
  ] =
    useState<UserDataSnapshot | null>(
      null,
    );

  const refreshSession =
    useCallback(
      async () => {
        setLoading(true);
        try {
          const response =
            await fetch(
              "/api/auth/session",
              {
                cache:
                  "no-store",
              },
            );
          const result =
            (await response.json()) as {
              account:
                | PublicAccount
                | null;
            };
          setAccount(
            result.account,
          );
          setSyncStatus(
            result.account
              ? "pending"
              : "local-only",
          );
          setLastSyncedAt(
            getLastSyncedAt(),
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const syncNow =
    useCallback(
      async () => {
        if (!account) {
          setSyncStatus(
            "local-only",
          );
          return;
        }

        setSyncStatus(
          "syncing",
        );

        try {
          const server =
            await fetchServerSnapshot();

          if (
            !server.snapshot
          ) {
            await pushLocalSnapshot({
              force: true,
            });
            setConflict(null);
            setSyncStatus(
              "synced",
            );
          } else {
            const result =
              await pushLocalSnapshot();

            if (
              result.status ===
              "conflict"
            ) {
              setConflict(
                result.serverSnapshot,
              );
              setSyncStatus(
                "conflict",
              );
              return;
            }

            setConflict(null);
            setSyncStatus(
              "synced",
            );
          }

          setLastSyncedAt(
            getLastSyncedAt(),
          );
        } catch {
          setSyncStatus(
            "error",
          );
        }
      },
      [account],
    );

  const uploadLocalData =
    useCallback(
      async () => {
        await pushLocalSnapshot({
          force: true,
        });
        setConflict(null);
        setSyncStatus(
          "synced",
        );
        setLastSyncedAt(
          getLastSyncedAt(),
        );
      },
      [],
    );

  const useServerData =
    useCallback(
      async () => {
        const server =
          await fetchServerSnapshot();

        if (
          server.snapshot
        ) {
          applyServerSnapshot(
            server.snapshot,
          );
          setConflict(null);
          setSyncStatus(
            "synced",
          );
          setLastSyncedAt(
            server.snapshot.updatedAt,
          );
          window.location.reload();
        }
      },
      [],
    );

  const signOut =
    useCallback(
      async () => {
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
          },
        );
        setAccount(null);
        setConflict(null);
        setSyncStatus(
          "local-only",
        );
      },
      [],
    );

  const value =
    useMemo(
      () => ({
        account,
        loading,
        syncStatus,
        lastSyncedAt,
        conflict,
        refreshSession,
        syncNow,
        uploadLocalData,
        useServerData,
        signOut,
      }),
      [
        account,
        loading,
        syncStatus,
        lastSyncedAt,
        conflict,
        refreshSession,
        syncNow,
        uploadLocalData,
        useServerData,
        signOut,
      ],
    );

  return (
    <AccountContext.Provider
      value={value}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context =
    useContext(
      AccountContext,
    );

  if (!context) {
    throw new Error(
      "useAccount must be used inside AccountProvider.",
    );
  }

  return context;
}
