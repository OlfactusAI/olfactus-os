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

describe("Explain Score panel", () => {
  it("renders the four core recommendation explanation layers", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/intelligence/recommendation-explanation-panel.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "Explain Score",
    );
    expect(source).toContain(
      "Strengths",
    );
    expect(source).toContain(
      "Friction",
    );
    expect(source).toContain(
      "Opportunity Cost",
    );
    expect(source).toContain(
      "Collection Impact Preview",
    );
  });
});
