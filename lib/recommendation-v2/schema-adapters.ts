import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";

export function readDnaScore(
  fragrance: FragranceRecord,
  candidates: string[],
  fallback = 50,
) {
  const dna =
    fragrance.dna as unknown as
      Record<string, unknown>;

  const values =
    candidates
      .map((key) => dna[key])
      .filter(
        (value): value is number =>
          typeof value === "number" &&
          Number.isFinite(value),
      );

  if (!values.length) {
    return fallback;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
    values.length
  );
}

export function readMarketPrice(
  fragrance: FragranceRecord,
): number | undefined {
  const market =
    fragrance.market as unknown as
      Record<string, unknown> |
      undefined;

  if (!market) {
    return undefined;
  }

  for (const key of [
    "typicalPrice",
    "retailPrice",
    "price",
    "priceUsd",
    "msrp",
    "retail",
    "averagePrice",
    "currentPrice",
  ]) {
    const value =
      market[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value > 0
    ) {
      return value;
    }
  }

  return undefined;
}
