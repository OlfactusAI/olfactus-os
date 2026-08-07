import type {
  ReferenceResearchPack,
} from "@/lib/gold-standard-builder/research-packs/types";

const storagePrefix =
  "olfactus:gold-standard-builder:research-pack:";

export function saveResearchPack(
  pack:
    ReferenceResearchPack,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    `${storagePrefix}${pack.fragranceId}`,
    JSON.stringify(
      pack,
    ),
  );
}

export function loadResearchPack(
  fragranceId: string,
):
  ReferenceResearchPack |
  undefined {
  if (
    typeof window ===
    "undefined"
  ) {
    return undefined;
  }

  const raw =
    window.localStorage.getItem(
      `${storagePrefix}${fragranceId}`,
    );

  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(
      raw,
    ) as ReferenceResearchPack;
  } catch {
    return undefined;
  }
}
