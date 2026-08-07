import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  readMarketPrice,
} from "@/lib/recommendation-v2/schema-adapters";

export function generateRecommendationCandidates({
  catalog,
  collection,
  budget,
}: {
  catalog: FragranceRecord[];
  collection: CollectionItem[];
  budget?: number;
}) {
  const owned =
    new Set(
      collection.map(
        (item) =>
          item.fragranceId,
      ),
    );

  return catalog.filter(
    (fragrance) => {
      if (
        owned.has(
          fragrance.id,
        )
      ) {
        return false;
      }

      const price =
        readMarketPrice(
          fragrance,
        );

      if (
        budget &&
        price &&
        price >
          budget * 1.35
      ) {
        return false;
      }

      return true;
    },
  );
}
