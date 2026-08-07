import {
  notFound,
} from "next/navigation";

import {
  PublicShareShell,
} from "@/components/sharing/public-share-shell";
import {
  readPublicShare,
} from "@/lib/sharing/store";

export default async function SharedCollectionPage({
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
      "collection"
  ) {
    notFound();
  }

  const collection =
    Array.isArray(
      share.payload
        .collection,
    )
      ? share.payload
          .collection
      : [];
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
      <section className="public-metric-grid">
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
      </section>

      <section className="public-share-panel">
        <p className="layer3-kicker">
          Selected Collection
        </p>
        <div className="public-bottle-grid">
          {collection.map(
            (
              item:
                Record<
                  string,
                  unknown
                >,
              index,
            ) => (
              <article
                key={
                  String(
                    item.fragranceId ??
                      index,
                  )
                }
              >
                <small>
                  {String(
                    item.brand ??
                      "Fragrance",
                  )}
                </small>
                <strong>
                  {String(
                    item.name ??
                      item.fragranceName ??
                      item.fragranceId ??
                      "Unknown",
                  )}
                </strong>
              </article>
            ),
          )}
        </div>
      </section>
    </PublicShareShell>
  );
}
