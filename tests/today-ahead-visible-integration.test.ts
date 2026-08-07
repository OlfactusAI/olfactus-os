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

describe("Today Ahead visible integration", () => {
  it("imports and renders PredictiveAhead exactly once on Today", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/today/page.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      'from "@/components/intelligence/predictive-ahead"',
    );
    expect(
      source.match(
        /<PredictiveAhead \/>/g,
      ) ?? [],
    ).toHaveLength(
      1,
    );
  });

  it("keeps the Ahead shell visible while forecast data calibrates", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/intelligence/predictive-ahead.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "Forecast signals are still calibrating",
    );
    expect(source).toContain(
      "Your next 90 days",
    );
  });
});
