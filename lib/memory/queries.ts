import type {
  MemoryEvent,
  MemoryQuerySummary,
} from "@/lib/memory/types";

export function summarizeMemory(
  events:
    MemoryEvent[],
): MemoryQuerySummary {
  const ordered =
    [...events].sort(
      (a, b) =>
        a.timestamp.localeCompare(
          b.timestamp,
        ),
    );

  const wears =
    events.filter(
      (event) =>
        event.type ===
        "wear-recorded",
    );
  const navigation =
    events.filter(
      (event) =>
        event.type ===
        "navigation",
    );
  const shown =
    events.filter(
      (event) =>
        event.type ===
        "recommendation-shown",
    );
  const accepted =
    events.filter(
      (event) =>
        event.type ===
        "recommendation-accepted",
    );

  const worn =
    countByEntity(
      wears,
      "fragrance",
    );
  const viewed =
    countByEntity(
      events.filter(
        (event) =>
          event.type ===
          "fragrance-viewed",
      ),
      "fragrance",
    );

  const mostWorn =
    topEntry(
      worn,
    );
  const mostViewed =
    topEntry(
      viewed,
    );

  return {
    totalEvents:
      events.length,
    firstEventAt:
      ordered.at(
        0,
      )?.timestamp,
    latestEventAt:
      ordered.at(
        -1,
      )?.timestamp,
    wearCount:
      wears.length,
    navigationCount:
      navigation.length,
    recommendationShownCount:
      shown.length,
    recommendationAcceptedCount:
      accepted.length,
    recommendationAcceptanceRate:
      shown.length
        ? Math.round(
            accepted.length /
              shown.length *
              100,
          )
        : undefined,
    mostWornFragranceId:
      mostWorn?.[0],
    mostWornCount:
      mostWorn?.[1] ??
      0,
    mostViewedFragranceId:
      mostViewed?.[0],
    mostViewedCount:
      mostViewed?.[1] ??
      0,
  };
}

export function queryEventsByType(
  events:
    MemoryEvent[],
  type:
    MemoryEvent["type"],
) {
  return events.filter(
    (event) =>
      event.type ===
      type,
  );
}

export function queryEventsByEntity(
  events:
    MemoryEvent[],
  entityId: string,
) {
  return events.filter(
    (event) =>
      event.entity?.id ===
      entityId,
  );
}

export function countEntityEvents({
  events,
  type,
  entityType,
}: {
  events:
    MemoryEvent[];
  type?:
    MemoryEvent["type"];
  entityType?:
    NonNullable<
      MemoryEvent["entity"]
    >["type"];
}) {
  const counts =
    new Map<
      string,
      number
    >();

  for (const event of events) {
    if (
      type &&
      event.type !==
        type
    ) {
      continue;
    }

    if (
      entityType &&
      event.entity?.type !==
        entityType
    ) {
      continue;
    }

    const id =
      event.entity?.id;

    if (!id) {
      continue;
    }

    counts.set(
      id,
      (counts.get(id) ??
        0) + 1,
    );
  }

  return [...counts.entries()]
    .sort(
      (a, b) =>
        b[1] -
        a[1],
    );
}

function countByEntity(
  events:
    MemoryEvent[],
  entityType:
    NonNullable<
      MemoryEvent["entity"]
    >["type"],
) {
  return new Map(
    countEntityEvents({
      events,
      entityType,
    }),
  );
}

function topEntry(
  values:
    Map<
      string,
      number
    >,
) {
  return [
    ...values.entries(),
  ].sort(
    (a, b) =>
      b[1] -
      a[1],
  )[0];
}
