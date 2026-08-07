import type {
  ReferenceReviewPackage,
} from "@/lib/reference-lab/review-types";

const storageKey =
  "olfactus:reference-lab:review-packages:v1";

export function loadReferenceReviewPackages():
  ReferenceReviewPackage[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const raw =
    window.localStorage.getItem(
      storageKey,
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        raw,
      ) as ReferenceReviewPackage[];

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveReferenceReviewPackages(
  packages:
    ReferenceReviewPackage[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(
      packages,
    ),
  );
}

export function upsertReferenceReviewPackage(
  reviewPackage:
    ReferenceReviewPackage,
) {
  const existing =
    loadReferenceReviewPackages();

  const next = [
    ...existing.filter(
      (item) =>
        item.packageId !==
        reviewPackage.packageId,
    ),
    reviewPackage,
  ];

  saveReferenceReviewPackages(
    next,
  );

  return next;
}
