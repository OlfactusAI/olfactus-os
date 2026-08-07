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

describe("v4.4.2-alpha.2 Analyst source integrity", () => {
  it("contains no identifiers split by nullish-coalescing fallbacks", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/intelligence/global-olfactus-analyst.tsx",
        ),
        "utf8",
      );

    const malformed =
      /[A-Za-z_][A-Za-z0-9_]*\s*\?\?\s*""[A-Za-z_][A-Za-z0-9_]*\s*\?\?\s*""/g;

    expect(
      source.match(
        malformed,
      ) ??
        [],
    ).toHaveLength(
      0,
    );

    expect(source).not.toContain(
      'summar ?? ""y',
    );
    expect(source).not.toContain(
      'actio ?? ""n',
    );
  });
});
