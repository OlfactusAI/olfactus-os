import {
  notFound,
} from "next/navigation";

import {
  PublicShareShell,
} from "@/components/sharing/public-share-shell";
import {
  readPublicShare,
} from "@/lib/sharing/store";

export default async function SharedRecommendationPage({
  params,
}: {
  params:
    Promise<{
      token: string;
    }>;
}) {
  const {
    token,
  } =
    await params;
  const share =
    await readPublicShare(
      token,
    );

  if (
    !share ||
    share.type !==
      "recommendation"
  ) {
    notFound();
  }

  return (
    <PublicShareShell
      share={share}
    >
      <section className="public-share-panel">
        <p className="layer3-kicker">
          Recommendation
        </p>
        <h2 className="display-serif mt-3 text-5xl">
          {String(
            share.payload
              .fragranceName ??
              "Shared recommendation",
          )}
        </h2>
        <p className="mt-5 text-[var(--muted)]">
          {String(
            share.payload
              .reason ??
              "Recommended through OLFACTUS intelligence.",
          )}
        </p>
        <div className="public-metric-grid mt-6">
          {Object.entries(
            (share.payload
              .metrics ??
              {}) as Record<
                string,
                string | number
              >,
          ).map(
            ([
              label,
              value,
            ]) => (
              <article
                key={label}
              >
                <small>
                  {label}
                </small>
                <strong>
                  {value}
                </strong>
              </article>
            ),
          )}
        </div>
      </section>
    </PublicShareShell>
  );
}
