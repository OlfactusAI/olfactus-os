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

describe("Reference Registry routes", () => {
  it("exposes registry, detail, and production pipeline routes", () => {
    const registry =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/reference-registry/page.tsx",
        ),
        "utf8",
      );

    const detail =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/reference-registry/[referenceId]/page.tsx",
        ),
        "utf8",
      );

    const pipeline =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/production-pipeline/page.tsx",
        ),
        "utf8",
      );

    expect(
      registry,
    ).toContain(
      "RegistryDashboard",
    );

    expect(
      detail,
    ).toContain(
      "RegistryDetail",
    );

    expect(
      pipeline,
    ).toContain(
      "PipelineDashboard",
    );
  });
});
