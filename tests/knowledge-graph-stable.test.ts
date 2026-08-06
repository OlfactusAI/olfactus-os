import { describe, expect, it } from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import {
  createUnifiedKnowledgeGraph,
  explainGraphRecommendation,
  getOverlap,
  getUnifiedGraphSignal,
} from "@/lib/intelligence/unified-graph-intelligence";
import { olfactusSystemManifest } from "@/lib/os/system-manifest";

describe("Knowledge Graph Stable integration", () => {
  const ownedIds = new Set(
    demoCollection.map(
      (item) => item.fragranceId,
    ),
  );
  const graph =
    createUnifiedKnowledgeGraph({
      catalog: fragrances,
      ownedIds,
    });

  it("publishes a stable v1.5.0 system manifest", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe("1.5.0");
    expect(
      olfactusSystemManifest.channel,
    ).toBe("stable");
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Knowledge Graph Intelligence",
    );
  });

  it("returns reusable graph signals for application pages", () => {
    const signal =
      getUnifiedGraphSignal({
        graph,
        catalog: fragrances,
        fragranceId:
          fragrances[0].id,
      });

    expect(signal.strategicValue).toBeGreaterThanOrEqual(0);
    expect(signal.expansionValue).toBeGreaterThanOrEqual(0);
    expect(signal.relatedFragrances.length).toBeGreaterThan(0);
    expect(
      explainGraphRecommendation(signal)
        .length,
    ).toBeGreaterThan(40);
  });

  it("provides a shared overlap API", () => {
    const overlap = getOverlap({
      catalog: fragrances,
      firstId: fragrances[0].id,
      secondId: fragrances[1].id,
    });

    expect(overlap).toBeGreaterThanOrEqual(0);
    expect(overlap).toBeLessThanOrEqual(100);
  });
});
