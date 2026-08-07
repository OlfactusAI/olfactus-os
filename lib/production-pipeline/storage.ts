import type {
  ProductionActivationPackage,
  ReferenceProductionPromotionPackage,
} from "@/lib/production-pipeline/types";

const promotionKey =
  "olfactus:production-pipeline:promotions:v1";

const activationKey =
  "olfactus:production-pipeline:activation-packages:v1";

export function loadProductionPromotions() {
  return loadArray<
    ReferenceProductionPromotionPackage
  >(
    promotionKey,
  );
}

export function saveProductionPromotion(
  promotion:
    ReferenceProductionPromotionPackage,
) {
  return upsert(
    promotionKey,
    promotion,
    (item) =>
      item.promotionId,
  );
}

export function loadProductionActivationPackages() {
  return loadArray<
    ProductionActivationPackage
  >(
    activationKey,
  );
}

export function saveProductionActivationPackage(
  activation:
    ProductionActivationPackage,
) {
  return upsert(
    activationKey,
    activation,
    (item) =>
      item.activationId,
  );
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

function upsert<T>(
  key: string,
  value: T,
  getId: (
    item: T,
  ) => string,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const current =
    loadArray<T>(
      key,
    );

  const next = [
    ...current.filter(
      (item) =>
        getId(
          item,
        ) !==
        getId(
          value,
        ),
    ),
    value,
  ];

  window.localStorage.setItem(
    key,
    JSON.stringify(
      next,
    ),
  );

  return next;
}
