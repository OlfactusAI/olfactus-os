import type {
  SharePrivacy,
} from "@/lib/sharing/types";

export function sanitizeCollectionPayload({
  collection,
  privacy,
}: {
  collection:
    Array<Record<string, unknown>>;
  privacy: SharePrivacy;
}) {
  return collection.map(
    (item) => {
      const sanitized = {
        ...item,
      };

      if (
        privacy.hidePrices
      ) {
        delete sanitized.purchasePrice;
      }

      if (
        privacy.hideWearHistory
      ) {
        delete sanitized.wearCount;
        delete sanitized.lastWornAt;
      }

      if (
        privacy.hideAcquisitionDates
      ) {
        delete sanitized.acquiredAt;
      }

      if (
        privacy.hidePrivateNotes
      ) {
        delete sanitized.notes;
        delete sanitized.privateNotes;
      }

      return sanitized;
    },
  );
}

export function buildVisibilitySummary(
  privacy:
    SharePrivacy,
) {
  return {
    included: [
      "Fragrance names",
      "Collection summary",
      "Family distribution",
    ],
    hidden: [
      privacy.hidePrices
        ? "Purchase prices"
        : null,
      privacy.hideWearHistory
        ? "Wear history"
        : null,
      privacy.hideAcquisitionDates
        ? "Acquisition dates"
        : null,
      privacy.hidePrivateNotes
        ? "Private notes"
        : null,
    ].filter(
      (
        item,
      ): item is string =>
        Boolean(item),
    ),
  };
}
