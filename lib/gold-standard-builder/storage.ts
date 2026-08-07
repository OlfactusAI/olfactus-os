import type {
  GoldStandardDatasetBuildState,
  GoldStandardDatasetTarget,
} from "@/lib/gold-standard-builder/types";

const targetsKey =
  "olfactus:gold-standard-builder:targets:v1";

const statePrefix =
  "olfactus:gold-standard-builder:state:";

export function loadGoldStandardTargets():
  GoldStandardDatasetTarget[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const raw =
    window.localStorage.getItem(
      targetsKey,
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        raw,
      ) as GoldStandardDatasetTarget[];

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveGoldStandardTargets(
  targets:
    GoldStandardDatasetTarget[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    targetsKey,
    JSON.stringify(
      targets,
    ),
  );
}

export function upsertGoldStandardTarget(
  target:
    GoldStandardDatasetTarget,
) {
  const current =
    loadGoldStandardTargets();

  const next = [
    ...current.filter(
      (item) =>
        item.fragranceId !==
        target.fragranceId,
    ),
    target,
  ];

  saveGoldStandardTargets(
    next,
  );

  return next;
}

export function loadGoldStandardBuildState(
  fragranceId: string,
): GoldStandardDatasetBuildState |
  undefined {
  if (
    typeof window ===
    "undefined"
  ) {
    return undefined;
  }

  const raw =
    window.localStorage.getItem(
      stateKey(
        fragranceId,
      ),
    );

  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(
      raw,
    ) as GoldStandardDatasetBuildState;
  } catch {
    return undefined;
  }
}

export function saveGoldStandardBuildState(
  state:
    GoldStandardDatasetBuildState,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    stateKey(
      state.target
        .fragranceId,
    ),
    JSON.stringify(
      state,
    ),
  );
}

function stateKey(
  fragranceId: string,
) {
  return `${statePrefix}${fragranceId}`;
}
