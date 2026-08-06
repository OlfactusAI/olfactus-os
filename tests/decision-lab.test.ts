import { describe, expect, it } from "vitest";

import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import { analyzeDecisionLab } from "@/lib/intelligence/decision-lab-engine";

describe("Decision Lab Engine", () => {
  const analysis = analyzeCollectionHealth({
    collection: demoCollection,
    profile: demoProfile,
    catalog: fragrances,
  });

  const ownedIds = new Set(
    demoCollection.map((item) => item.fragranceId),
  );

  const owned = fragrances.filter((fragrance) =>
    ownedIds.has(fragrance.id),
  );

  it("returns a complete explainable verdict for an unowned candidate", () => {
    const candidate = fragrances.find(
      (fragrance) => !ownedIds.has(fragrance.id),
    );

    expect(candidate).toBeDefined();

    const result = analyzeDecisionLab({
      candidate: candidate!,
      owned,
      analysis,
    });

    expect(["buy", "sample", "skip"]).toContain(result.verdict);
    expect(result.modelVersion).toBe("DL-1.0.0");
    expect(result.positiveReasons.length).toBeGreaterThan(0);
    expect(result.watchReasons.length).toBeGreaterThan(0);
    expect(result.impactDimensions).toHaveLength(5);
    expect(result.analystReport.length).toBeGreaterThan(100);
  });

  it("reduces value confidence when an observed price is very high", () => {
    const candidate = fragrances.find(
      (fragrance) => !ownedIds.has(fragrance.id),
    )!;

    const normal = analyzeDecisionLab({
      candidate,
      owned,
      analysis,
      price: 180,
    });

    const expensive = analyzeDecisionLab({
      candidate,
      owned,
      analysis,
      price: 650,
    });

    expect(expensive.metrics.value).toBeLessThan(normal.metrics.value);
    expect(expensive.metrics.regretRisk).toBeGreaterThan(
      normal.metrics.regretRisk,
    );
  });

  it("skips a fragrance that is already owned", () => {
    const candidate = owned[0];

    const result = analyzeDecisionLab({
      candidate,
      owned,
      analysis,
    });

    expect(result.verdict).toBe("skip");
  });
});
