import {
  notFound,
} from "next/navigation";

import {
  PublicShareShell,
} from "@/components/sharing/public-share-shell";
import {
  readPublicShare,
} from "@/lib/sharing/store";

export default async function SharedSimulationPage({
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
      "simulation"
  ) {
    notFound();
  }

  const metrics =
    (share.payload
      .metrics ??
      {}) as
      Record<
        string,
        string | number
      >;

  return (
    <PublicShareShell
      share={share}
    >
      <section className="public-share-panel">
        <p className="layer3-kicker">
          Simulated Impact
        </p>
        <div className="public-metric-grid mt-5">
          {Object.entries(
            metrics,
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
        <p className="mt-6 text-[var(--muted)]">
          {String(
            share.payload
              .summary ??
              "A private collection simulation shared through OLFACTUS.",
          )}
        </p>
      </section>
    </PublicShareShell>
  );
}
