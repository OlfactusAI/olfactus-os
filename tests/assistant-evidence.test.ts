import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildCollectorAssistantInsights,
} from "@/lib/intelligence/collector-assistant-engine";
import {
  demoCollection,
  demoProfile,
} from "@/lib/data/demo";
import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  analyzeCollectionHealth,
} from "@/lib/intelligence/collection-health";

describe("Collector Assistant evidence", () => {
  it("provides evidence for every generated insight", () => {
    const analysis =
      analyzeCollectionHealth({
        collection:
          demoCollection,
        catalog:
          fragrances,
        profile:
          demoProfile,
      });
    const insights =
      buildCollectorAssistantInsights({
        collection:
          demoCollection,
        catalog:
          fragrances,
        analysis,
      });

    expect(
      insights.length,
    ).toBeGreaterThan(0);
    expect(
      insights.every(
        (insight) =>
          insight.evidence
            .length > 0,
      ),
    ).toBe(true);
  });
});
