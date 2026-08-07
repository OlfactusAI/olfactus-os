import type {
  GlobalFragranceRecord,
} from "@/lib/database/schema";
import {
  createCanonicalSlug,
  normalizeEntityName,
} from "@/lib/database/normalization";

export interface DuplicateCandidate {
  firstId: string;
  secondId: string;
  confidence: number;
  reasons: string[];
}

export function findDuplicateFragrances(
  fragrances: GlobalFragranceRecord[],
): DuplicateCandidate[] {
  const candidates:
    DuplicateCandidate[] = [];

  for (
    let firstIndex = 0;
    firstIndex < fragrances.length;
    firstIndex += 1
  ) {
    for (
      let secondIndex =
        firstIndex + 1;
      secondIndex <
      fragrances.length;
      secondIndex += 1
    ) {
      const first =
        fragrances[firstIndex];
      const second =
        fragrances[secondIndex];

      const reasons: string[] = [];
      let confidence = 0;

      if (
        first.canonicalSlug ===
        second.canonicalSlug
      ) {
        confidence += 65;
        reasons.push(
          "Canonical slugs match.",
        );
      }

      if (
        normalizeEntityName(
          first.brand,
        ).toLowerCase() ===
        normalizeEntityName(
          second.brand,
        ).toLowerCase()
      ) {
        confidence += 12;
        reasons.push(
          "Brand names match.",
        );
      }

      if (
        createCanonicalSlug(
          first.name,
        ) ===
        createCanonicalSlug(
          second.name,
        )
      ) {
        confidence += 18;
        reasons.push(
          "Fragrance names normalize to the same value.",
        );
      }

      if (
        first.releaseYear &&
        second.releaseYear &&
        first.releaseYear ===
          second.releaseYear
      ) {
        confidence += 5;
        reasons.push(
          "Release years match.",
        );
      }

      if (confidence >= 65) {
        candidates.push({
          firstId: first.id,
          secondId: second.id,
          confidence:
            Math.min(
              100,
              confidence,
            ),
          reasons,
        });
      }
    }
  }

  return candidates.sort(
    (a, b) =>
      b.confidence -
      a.confidence,
  );
}
