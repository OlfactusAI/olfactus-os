import type {
  AnalystActivity,
} from "@/lib/analyst/types";

const storageKey =
  "olfactus.analyst.activity.v1";

export function readAnalystActivity():
  AnalystActivity[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey,
      );

    return raw
      ? (JSON.parse(
          raw,
        ) as AnalystActivity[])
      : [];
  } catch {
    return [];
  }
}

export function appendAnalystActivity(
  activity:
    Omit<
      AnalystActivity,
      "id" | "createdAt"
    >,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const next:
    AnalystActivity = {
      ...activity,
      id:
        `analyst:${Date.now()}:${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      createdAt:
        new Date().toISOString(),
  };

  const ledger = [
    next,
    ...readAnalystActivity(),
  ].slice(
    0,
    300,
  );

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(
      ledger,
    ),
  );
}
