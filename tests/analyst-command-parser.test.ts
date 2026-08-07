import {
  describe,
  expect,
  it,
} from "vitest";

import {
  parseAnalystCommand,
} from "@/lib/analyst/commands";

describe("Proactive Analyst command parser", () => {
  it("parses supported commands", () => {
    expect(
      parseAnalystCommand(
        "/wear Imagination",
      ).intent,
    ).toBe(
      "record-wear",
    );
    expect(
      parseAnalystCommand(
        "/compare Ganymede vs Reflection Man",
      ).arguments,
    ).toEqual([
      "Ganymede",
      "Reflection Man",
    ]);
    expect(
      parseAnalystCommand(
        "Why is my Collection Health 82?",
      ).intent,
    ).toBe(
      "explain-health",
    );
  });
});
