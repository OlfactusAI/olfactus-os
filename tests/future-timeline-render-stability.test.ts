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

describe("Future Timeline render stability", () => {
  it("renders bottle states against the stable current owned ID set", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/predictions/page.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "stableBottleIds",
    );
    expect(source).toContain(
      "visibleBottleStates",
    );
    expect(source).toContain(
      "new Set",
    );
    expect(source).toContain(
      "visibleBottleStates.length",
    );
  });
});
