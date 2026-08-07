import {
  describe,
  expect,
  it,
} from "vitest";

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
import {
  buildCollectorAssistantInsights,
} from "@/lib/intelligence/collector-assistant-engine";
import {
  simulateCollectionScenario,
} from "@/lib/intelligence/multi-step-simulator";

describe("Intelligence Layer 3 integration", () => {
  it("connects health, assistant, and simulator outputs", () => {
    const health =
      analyzeCollectionHealth({
        collection:
          demoCollection,
        catalog:
          fragrances,
        profile:
          demoProfile,
      });
    const assistant =
      buildCollectorAssistantInsights({
        collection:
          demoCollection,
        catalog:
          fragrances,
        analysis:
          health,
      });
    const candidate =
      fragrances.find(
        (fragrance) =>
          !demoCollection.some(
            (item) =>
              item.fragranceId ===
              fragrance.id,
          ),
      );

    expect(candidate).toBeTruthy();

    const simulation =
      simulateCollectionScenario({
        steps: [
          {
            id: "candidate",
            action: "add",
            candidateId:
              candidate!.id,
          },
        ],
        collection:
          demoCollection,
        catalog:
          fragrances,
        profile:
          demoProfile,
      });

    expect(
      health.calibration,
    ).toBeDefined();
    expect(
      assistant.every(
        (insight) =>
          insight.evidence
            .length > 0,
      ),
    ).toBe(true);
    expect(
      simulation.steps,
    ).toHaveLength(1);
  });
});
