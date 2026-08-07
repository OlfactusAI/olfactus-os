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

describe("Production Activation Bridge route", () => {
  it("exposes controlled runtime activation and rollback", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/production-activation/page.tsx",
        ),
        "utf8",
      );

    const workspace =
      readFileSync(
        join(
          process.cwd(),
          "components/production-activation/activation-dashboard.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "ActivationDashboard",
    );

    expect(
      workspace,
    ).toContain(
      "Activate runtime reference",
    );

    expect(
      workspace,
    ).toContain(
      "Roll back activation",
    );
  });
});
