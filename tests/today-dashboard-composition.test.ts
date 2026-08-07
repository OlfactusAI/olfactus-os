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

describe("Today dashboard composition", () => {
  const source =
    readFileSync(
      join(
        process.cwd(),
        "app/(app)/today/page.tsx",
      ),
      "utf8",
    );

  it("renders exactly one Live Mission Control component", () => {
    const matches =
      source.match(
        /<LiveMissionControl \/>/g,
      ) ?? [];

    expect(matches).toHaveLength(
      1,
    );
  });

  it("does not retain the old inline dashboard root", () => {
    expect(source).not.toContain(
      '<section className="mission-control-grid mt-6">',
    );
  });
});
