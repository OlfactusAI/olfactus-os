import type {
  ReferenceWorkspaceDraft,
} from "@/lib/reference-lab/workspace";

const storagePrefix =
  "olfactus:reference-lab:workspace:";

export function saveReferenceWorkspaceDraft(
  draft:
    ReferenceWorkspaceDraft,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    storageKey(
      draft.fragranceId,
    ),
    JSON.stringify(
      draft,
    ),
  );
}

export function loadReferenceWorkspaceDraft(
  fragranceId: string,
): ReferenceWorkspaceDraft |
  undefined {
  if (
    typeof window ===
    "undefined"
  ) {
    return undefined;
  }

  const raw =
    window.localStorage.getItem(
      storageKey(
        fragranceId,
      ),
    );

  if (!raw) {
    return undefined;
  }

  try {
    const parsed =
      JSON.parse(
        raw,
      ) as ReferenceWorkspaceDraft;

    return parsed.workspaceVersion ===
      "RWL-1.0.0"
      ? parsed
      : undefined;
  } catch {
    return undefined;
  }
}

export function clearReferenceWorkspaceDraft(
  fragranceId: string,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    storageKey(
      fragranceId,
    ),
  );
}

function storageKey(
  fragranceId: string,
) {
  return `${storagePrefix}${fragranceId}`;
}
