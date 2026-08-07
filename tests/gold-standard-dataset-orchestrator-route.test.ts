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

describe("Gold Standard Dataset orchestrator route", () => {
  it("exposes consensus, conflict resolution, and certification preparation", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/gold-standard-builder/orchestrate/page.tsx",
        ),
        "utf8",
      );

    const workspace =
      readFileSync(
        join(
          process.cwd(),
          "components/gold-standard-builder/dataset-orchestrator.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "DatasetOrchestrator",
    );

    expect(
      workspace,
    ).toContain(
      "Generate dataset consensus",
    );

    expect(
      workspace,
    ).toContain(
      "Certify + prepare production",
    );

    expect(
      workspace,
    ).toContain(
      "Activation package ready",
    );
  });
});
