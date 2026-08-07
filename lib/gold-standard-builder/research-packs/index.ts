import aventusData from "@/lib/gold-standard-builder/research-packs/aventus.json";
import type {
  ReferenceResearchPack,
} from "@/lib/gold-standard-builder/research-packs/types";

export const aventusReferenceResearchPack =
  aventusData as ReferenceResearchPack;

export function getResearchPackForFragrance(
  fragranceId: string,
) {
  if (
    fragranceId ===
    aventusReferenceResearchPack.fragranceId
  ) {
    return aventusReferenceResearchPack;
  }

  return undefined;
}

export function getResearchFactsForSection(
  fragranceId: string,
  sectionId: string,
) {
  const pack =
    getResearchPackForFragrance(
      fragranceId,
    );

  if (!pack) {
    return [];
  }

  const ids =
    new Set(
      pack.sectionEvidence[
        sectionId
      ] ??
      [],
    );

  return pack.facts.filter(
    (fact) =>
      ids.has(
        fact.factId,
      ),
  );
}
