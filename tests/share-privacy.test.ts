import {
  describe,
  expect,
  it,
} from "vitest";

import {
  sanitizeCollectionPayload,
} from "@/lib/sharing/privacy";

describe("Privacy-safe collection publishing", () => {
  it("removes sensitive collection fields", () => {
    const result =
      sanitizeCollectionPayload({
        collection: [
          {
            fragranceId:
              "aventus",
            purchasePrice:
              425,
            wearCount: 7,
            lastWornAt:
              "2026-08-01",
            acquiredAt:
              "2026-01-01",
            privateNotes:
              "Private",
          },
        ],
        privacy: {
          hidePrices: true,
          hideWearHistory: true,
          hideAcquisitionDates: true,
          hidePrivateNotes: true,
          disableIndexing: true,
        },
      });

    expect(
      result[0],
    ).not.toHaveProperty(
      "purchasePrice",
    );
    expect(
      result[0],
    ).not.toHaveProperty(
      "wearCount",
    );
    expect(
      result[0],
    ).not.toHaveProperty(
      "acquiredAt",
    );
    expect(
      result[0],
    ).not.toHaveProperty(
      "privateNotes",
    );
  });
});
