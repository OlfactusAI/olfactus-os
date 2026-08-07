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

describe("Analyst response narrowing regression", () => {
  it("captures recommendation fragranceId after discriminated-union narrowing", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "tests/analyst-engine.test.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      'result.response.type ===\n      "recommendation"',
    );
    expect(source).toContain(
      "const fragranceId =",
    );
    expect(source).toContain(
      "item.fragranceId ===\n              fragranceId",
    );
  });
});
