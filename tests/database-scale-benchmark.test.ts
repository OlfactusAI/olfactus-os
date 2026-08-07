import {
  describe,
  expect,
  it,
} from "vitest";

import {
  runScaleBenchmarkSuite,
  runSyntheticScaleBenchmark,
} from "@/lib/database/scale/synthetic-benchmark";

describe("Database scale benchmark", () => {
  it("builds all required scale targets", () => {
    const suite =
      runScaleBenchmarkSuite();

    expect(
      suite.map(
        (result) =>
          result.recordCount,
      ),
    ).toEqual([
      1_000,
      5_000,
      10_000,
      25_000,
      50_000,
    ]);
  });

  it("returns a 50-record page and indexed search matches", () => {
    const result =
      runSyntheticScaleBenchmark(
        1_000,
      );

    expect(
      result.pageCount,
    ).toBe(50);
    expect(
      result.resultCount,
    ).toBeGreaterThan(0);
  });
});
