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
  parseAnalystCommand,
} from "@/lib/analyst/commands";
import {
  runAnalystCommand,
} from "@/lib/analyst/engine";
import {
  buildEntityRegistry,
} from "@/lib/entities/registry";
import {
  analyzeCollectionHealth,
} from "@/lib/intelligence/collection-health";

describe("Proactive Analyst guardrails", () => {
  it("does not invent unresolved comparison entities", () => {
    const result =
      runAnalystCommand({
        command:
          parseAnalystCommand(
            "/compare NotARealFragrance vs AlsoFake",
          ),
        collection:
          demoCollection,
        catalog:
          fragrances,
        analysis:
          analyzeCollectionHealth({
            collection:
              demoCollection,
            profile:
              demoProfile,
            catalog:
              fragrances,
          }),
        registry:
          buildEntityRegistry(
            fragrances,
          ),
      });

    expect(
      result.response.type,
    ).toBe(
      "message",
    );
    expect(
      result.preview,
    ).toBeUndefined();
  });
});
