export interface ScaleBenchmarkResult {
  recordCount: number;
  generationMs: number;
  indexingMs: number;
  searchMs: number;
  pageMs: number;
  estimatedMemoryMb: number;
  recommendedShardCount: number;
  status:
    | "excellent"
    | "good"
    | "review";
}

export function runSyntheticScaleBenchmark(
  recordCount: number,
) {
  const safeCount =
    Math.max(
      1,
      Math.floor(
        recordCount,
      ),
    );
  const generationStarted =
    performanceNow();
  const records =
    Array.from(
      {
        length:
          safeCount,
      },
      (_, index) => ({
        id:
          `synthetic-${index}`,
        label:
          `Synthetic Fragrance ${index}`,
        brand:
          `Brand ${index % 400}`,
        tokens: [
          `family-${index % 12}`,
          `note-${index % 80}`,
          `accord-${index % 24}`,
        ],
      }),
    );
  const generationMs =
    performanceNow() -
    generationStarted;

  const indexingStarted =
    performanceNow();
  const index =
    new Map<
      string,
      string[]
    >();

  for (const record of records) {
    for (const token of [
      record.label,
      record.brand,
      ...record.tokens,
    ]) {
      const normalized =
        token.toLowerCase();
      const values =
        index.get(normalized) ??
        [];
      values.push(
        record.id,
      );
      index.set(
        normalized,
        values,
      );
    }
  }
  const indexingMs =
    performanceNow() -
    indexingStarted;

  const searchStarted =
    performanceNow();
  const query =
    "family-5";
  const searchResults =
    index.get(query) ?? [];
  const searchMs =
    performanceNow() -
    searchStarted;

  const pageStarted =
    performanceNow();
  const page =
    records.slice(
      100,
      150,
    );
  const pageMs =
    performanceNow() -
    pageStarted;

  const estimatedMemoryMb =
    Math.round(
      (
        JSON.stringify(
          records,
        ).length *
        2
      ) /
        1024 /
        1024 *
        10,
    ) / 10;
  const recommendedShardCount =
    Math.max(
      1,
      Math.ceil(
        safeCount /
          10_000,
      ),
    );
  const total =
    generationMs +
    indexingMs;

  return {
    recordCount:
      safeCount,
    generationMs:
      round(generationMs),
    indexingMs:
      round(indexingMs),
    searchMs:
      round(searchMs),
    pageMs:
      round(pageMs),
    estimatedMemoryMb,
    recommendedShardCount,
    status:
      total < 1000
        ? "excellent"
        : total < 3000
          ? "good"
          : "review",
    resultCount:
      searchResults.length,
    pageCount:
      page.length,
  } satisfies ScaleBenchmarkResult & {
    resultCount: number;
    pageCount: number;
  };
}

export function runScaleBenchmarkSuite() {
  return [
    1_000,
    5_000,
    10_000,
    25_000,
    50_000,
  ].map(
    runSyntheticScaleBenchmark,
  );
}

function performanceNow() {
  return typeof performance !==
    "undefined"
    ? performance.now()
    : Date.now();
}

function round(
  value: number,
) {
  return Math.round(
    value * 100,
  ) / 100;
}
