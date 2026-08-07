import type {
  ReferenceConsensusRun,
  ReferenceConflictResolution,
} from "@/lib/reference-lab/consensus-types";

const runStorageKey =
  "olfactus:reference-lab:consensus-runs:v1";

const resolutionStorageKey =
  "olfactus:reference-lab:conflict-resolutions:v1";

export function loadReferenceConsensusRuns():
  ReferenceConsensusRun[] {
  return loadArray<
    ReferenceConsensusRun
  >(
    runStorageKey,
  );
}

export function saveReferenceConsensusRuns(
  runs:
    ReferenceConsensusRun[],
) {
  saveArray(
    runStorageKey,
    runs,
  );
}

export function upsertReferenceConsensusRun(
  run:
    ReferenceConsensusRun,
) {
  const current =
    loadReferenceConsensusRuns();

  const next = [
    ...current.filter(
      (item) =>
        item.runId !==
        run.runId,
    ),
    run,
  ];

  saveReferenceConsensusRuns(
    next,
  );

  return next;
}

export function loadReferenceConflictResolutions():
  ReferenceConflictResolution[] {
  return loadArray<
    ReferenceConflictResolution
  >(
    resolutionStorageKey,
  );
}

export function saveReferenceConflictResolutions(
  resolutions:
    ReferenceConflictResolution[],
) {
  saveArray(
    resolutionStorageKey,
    resolutions,
  );
}

export function appendReferenceConflictResolution(
  resolution:
    ReferenceConflictResolution,
) {
  const current =
    loadReferenceConflictResolutions();

  const next = [
    ...current.filter(
      (item) =>
        item.resolutionId !==
        resolution.resolutionId,
    ),
    resolution,
  ];

  saveReferenceConflictResolutions(
    next,
  );

  return next;
}

function loadArray<T>(
  key: string,
): T[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const raw =
    window.localStorage.getItem(
      key,
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        raw,
      ) as T[];

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveArray<T>(
  key: string,
  value: T[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify(
      value,
    ),
  );
}
