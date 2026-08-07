import {
  describe,
  expect,
  it,
} from "vitest";
import {
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

describe("Unified Recommendation migration", () => {
  it("uses canonical collector context and personal forecast state", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligence/unified-recommendation-engine.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "api.getCollectorState()",
    );
    expect(source).toContain(
      "api.getOwnedFragrances()",
    );
    expect(source).toContain(
      "api.getFragranceState",
    );
    expect(source).toContain(
      '"RE-4.1.0"',
    );
  });
});
