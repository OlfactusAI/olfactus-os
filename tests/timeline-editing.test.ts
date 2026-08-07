import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  TimelineEvent,
} from "@/lib/timeline/types";

describe("Editable Timeline contract", () => {
  it("preserves the event ID while applying editable fields", () => {
    const event:
      TimelineEvent = {
        id: "event-1",
        type:
          "sample_added",
        timestamp:
          "2026-01-01T00:00:00.000Z",
        title:
          "Sample added",
        summary:
          "Initial",
      };

    const updated = {
      ...event,
      title:
        "Sample corrected",
      summary:
        "Corrected note",
    };

    expect(updated.id).toBe(
      event.id,
    );
    expect(updated.title).toBe(
      "Sample corrected",
    );
  });
});
