"use client";

import {
  ArrowRight,
  Cloud,
  Download,
  LogOut,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import {
  useAccount,
} from "@/components/providers/account-provider";
import { ConflictReview } from "@/components/account/conflict-review";
import { ShareManager } from "@/components/sharing/share-manager";
import { loadOfflineQueue } from "@/lib/sync/offline-queue";
import { flushOfflineQueue } from "@/lib/sync/operation-client";
import {
  downloadOlfactusBackup,
} from "@/lib/system/backup";
import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

export default function AccountPage() {
  const router =
    useRouter();
  const {
    account,
    loading,
    syncStatus,
    lastSyncedAt,
    conflict,
    syncNow,
    uploadLocalData,
    useServerData,
    signOut,
  } = useAccount();
  const [
    message,
    setMessage,
  ] = useState("");
  const [
    pendingOperations,
    setPendingOperations,
  ] = useState(0);

  useEffect(() => {
    const refresh = () =>
      setPendingOperations(
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

  if (loading) {
    return (
      <div className="layer3-panel">
        Loading account…
      </div>
    );
  }

  if (!account) {
    return (
      <div className="account-empty">
        <ShieldCheck
          size={32}
        />
        <p className="layer3-kicker">
          Private by default
        </p>
        <h1 className="display-serif">
          Add an account when you are ready to synchronize.
        </h1>
        <p>
          Guest mode remains available. Signing in adds server persistence and cross-device synchronization.
        </p>
        <div>
          <button
            onClick={() =>
              router.push(
                "/signup",
              )
            }
          >
            Create account
            <ArrowRight
              size={15}
            />
          </button>
          <button
            onClick={() =>
              router.push(
                "/login",
              )
            }
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  async function removeAccount() {
    const confirmed =
      window.confirm(
        "Delete this account and its server-stored OLFACTUS data? Export a backup first.",
      );

    if (!confirmed) {
      return;
    }

    const response =
      await fetch(
        "/api/account/delete",
        {
          method: "DELETE",
        },
      );

    if (response.ok) {
      router.push(
        "/today",
      );
      router.refresh();
    }
  }

  return (
    <div className="pb-12">
      <section className="layer3-hero">
        <div>
          <p className="layer3-kicker">
            Account & Sync
          </p>
          <h1 className="display-serif mt-4 text-[clamp(3.8rem,7vw,7rem)] leading-[.88]">
            Your collection,
            <br />
            <span className="text-[var(--gold-bright)]">
              beyond one browser.
            </span>
          </h1>
          <p className="mt-6 text-[var(--muted)]">
            Signed in as{" "}
            <strong className="text-[var(--foreground)]">
              {account.email}
            </strong>
          </p>
        </div>
        <Cloud
          size={52}
          className="text-[var(--gold)]"
        />
      </section>

      <section className="mt-7 grid gap-5 lg:grid-cols-2">
        <article className="layer3-panel">
          <p className="layer3-kicker">
            Synchronization
          </p>
          <h2 className="display-serif mt-3 text-4xl">
            {syncStatus ===
            "synced"
              ? "Your account is synchronized."
              : syncStatus ===
                  "conflict"
                ? "A sync conflict needs review."
                : "Local changes are ready to synchronize."}
          </h2>
          <p className="mt-4 text-sm text-[var(--muted)]">
            {lastSyncedAt
              ? `Last synced ${new Date(
                  lastSyncedAt,
                ).toLocaleString()}.`
              : "No successful synchronization recorded yet."}
          </p>

          <div className="mt-6 grid gap-3">
            <button
              className="layer3-apply"
              onClick={() =>
                void syncNow()
              }
            >
              <Cloud
                size={15}
              />
              Sync now
            </button>

            <button
              className="layer3-secondary"
              onClick={() =>
                void uploadLocalData()
              }
            >
              <UploadCloud
                size={15}
              />
              Upload local data
            </button>

            {conflict ? (
              <button
                className="layer3-secondary"
                onClick={() =>
                  void useServerData()
                }
              >
                Use server version
              </button>
            ) : null}
          </div>
        </article>

        <article className="layer3-panel">
          <p className="layer3-kicker">
            Privacy & Ownership
          </p>
          <h2 className="display-serif mt-3 text-4xl">
            Your data remains yours.
          </h2>
          <div className="mt-6 grid gap-3">
            <button
              className="layer3-secondary"
              onClick={() =>
                downloadOlfactusBackup(
                  olfactusSystemManifest.version,
                )
              }
            >
              <Download
                size={15}
              />
              Export all local data
            </button>

            <button
              className="layer3-secondary"
              onClick={async () => {
                await signOut();
                router.push(
                  "/today",
                );
                router.refresh();
              }}
            >
              <LogOut
                size={15}
              />
              Sign out
            </button>

            <button
              className="account-danger"
              onClick={() =>
                void removeAccount()
              }
            >
              <Trash2
                size={15}
              />
              Delete account and server data
            </button>
          </div>
          {message ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              {message}
            </p>
          ) : null}
        </article>
      </section>

      <section className="layer3-panel mt-6">
        <p className="layer3-kicker">
          Offline Operations
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="display-serif text-3xl">
              {pendingOperations} local change{pendingOperations === 1 ? "" : "s"} pending
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Queued operations remain on this device until the server accepts them.
            </p>
          </div>
          <button
            className="layer3-secondary"
            onClick={async () => {
              const result =
                await flushOfflineQueue();
              setPendingOperations(
                loadOfflineQueue().length,
              );
              setMessage(
                `${result.accepted} operation(s) synced; ${result.conflicts} conflict(s) detected.`,
              );
            }}
          >
            Flush queue
          </button>
        </div>
      </section>

      <ShareManager />

      <section className="layer3-panel mt-6">
        <p className="layer3-kicker">
          Conflict Review
        </p>
        <h2 className="display-serif mt-3 text-4xl">
          Resolve only the fields that disagree.
        </h2>
        <div className="mt-5">
          <ConflictReview />
        </div>
      </section>
    </div>
  );
}
