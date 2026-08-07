"use client";

import {
  Copy,
  Eye,
  Link2,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import type {
  ShareRecord,
  ShareType,
} from "@/lib/sharing/types";

export function ShareManager() {
  const [
    shares,
    setShares,
  ] =
    useState<ShareRecord[]>(
      [],
    );
  const [
    title,
    setTitle,
  ] = useState(
    "My OLFACTUS collection",
  );
  const [
    type,
    setType,
  ] =
    useState<ShareType>(
      "collection",
    );
  const [
    message,
    setMessage,
  ] = useState("");

  async function refresh() {
    const response =
      await fetch(
        "/api/shares",
        {
          cache: "no-store",
        },
      );
    if (response.ok) {
      const result =
        (await response.json()) as {
          shares:
            ShareRecord[];
        };
      setShares(
        result.shares,
      );
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function create() {
    const payload =
      type ===
      "collection"
        ? {
            collection: [],
            metrics: {
              "Collection Health":
                "Private snapshot",
              "Collection Size":
                "Selected bottles",
            },
          }
        : type ===
            "simulation"
          ? {
              summary:
                "Shared simulation result",
              metrics: {
                "Collection Health":
                  "+4",
                Diversity:
                  "+7",
                Risk:
                  "Moderate",
                Confidence:
                  "82%",
              },
            }
          : {
              fragranceName:
                "Shared recommendation",
              reason:
                "Selected through OLFACTUS intelligence.",
              metrics: {
                Confidence:
                  "82%",
                Occasion:
                  "Versatile",
              },
            };

    const response =
      await fetch(
        "/api/shares",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            type,
            title,
            visibility:
              "unlisted",
            privacy: {
              hidePrices: true,
              hideWearHistory: true,
              hideAcquisitionDates: true,
              hidePrivateNotes: true,
              disableIndexing: true,
            },
            payload,
          }),
        },
      );

    if (!response.ok) {
      setMessage(
        "Unable to create share.",
      );
      return;
    }

    setMessage(
      "Share created.",
    );
    await refresh();
  }

  function sharePath(
    share:
      ShareRecord,
  ) {
    return `/share/${share.type}/${share.token}`;
  }

  return (
    <section className="layer3-panel mt-6">
      <p className="layer3-kicker">
        Your Shared Links
      </p>
      <h2 className="display-serif mt-3 text-4xl">
        Publish only what you choose.
      </h2>

      <div className="share-create-grid mt-5">
        <label>
          <span>
            Type
          </span>
          <select
            value={type}
            onChange={(
              event,
            ) =>
              setType(
                event.target
                  .value as
                  ShareType,
              )
            }
          >
            <option value="collection">
              Collection
            </option>
            <option value="simulation">
              Simulation
            </option>
            <option value="recommendation">
              Recommendation
            </option>
          </select>
        </label>

        <label>
          <span>
            Title
          </span>
          <input
            value={title}
            onChange={(
              event,
            ) =>
              setTitle(
                event.target
                  .value,
              )
            }
          />
        </label>

        <button
          type="button"
          className="layer3-apply"
          onClick={() =>
            void create()
          }
        >
          <Link2
            size={14}
          />
          Create private link
        </button>
      </div>

      <div className="share-privacy-summary mt-4">
        <strong>
          Included
        </strong>
        <span>
          Fragrance names · Collection summary · Family distribution
        </span>
        <strong>
          Hidden
        </strong>
        <span>
          Prices · Wear history · Acquisition dates · Private notes
        </span>
      </div>

      {message ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        {shares.map(
          (share) => (
            <article
              key={
                share.id
              }
              className="share-row"
            >
              <div className="min-w-0 flex-1">
                <small>
                  {
                    share.type
                  }{" "}
                  ·{" "}
                  {
                    share.visibility
                  }
                </small>
                <strong>
                  {
                    share.title
                  }
                </strong>
                <span>
                  <Eye
                    size={12}
                  />
                  {
                    share.viewCount
                  }{" "}
                  views
                </span>
              </div>

              <button
                type="button"
                title="Copy link"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `${window.location.origin}${sharePath(
                      share,
                    )}`,
                  );
                  setMessage(
                    "Link copied.",
                  );
                }}
              >
                <Copy
                  size={13}
                />
              </button>

              <button
                type="button"
                title="Regenerate token"
                onClick={async () => {
                  await fetch(
                    `/api/shares/${share.token}`,
                    {
                      method:
                        "PATCH",
                    },
                  );
                  await refresh();
                }}
              >
                <RefreshCcw
                  size={13}
                />
              </button>

              <button
                type="button"
                title="Revoke"
                onClick={async () => {
                  await fetch(
                    `/api/shares/${share.token}`,
                    {
                      method:
                        "DELETE",
                    },
                  );
                  await refresh();
                }}
              >
                <Trash2
                  size={13}
                />
              </button>
            </article>
          ),
        )}

        {!shares.length ? (
          <p className="text-sm text-[var(--muted)]">
            No shared links yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
