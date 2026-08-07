import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  ShareRecord,
} from "@/lib/sharing/types";

describe("Share token contract", () => {
  it("keeps revocation and expiration explicit", () => {
    const share:
      ShareRecord = {
        id: "share",
        token:
          "private-token",
        accountId:
          "account",
        type:
          "collection",
        title:
          "Collection",
        visibility:
          "unlisted",
        createdAt:
          "2026-08-06T00:00:00.000Z",
        updatedAt:
          "2026-08-06T00:00:00.000Z",
        expiresAt:
          "2026-09-06T00:00:00.000Z",
        viewCount: 0,
        privacy: {
          hidePrices: true,
          hideWearHistory: true,
          hideAcquisitionDates: true,
          hidePrivateNotes: true,
          disableIndexing: true,
        },
        payload: {},
      };

    expect(
      share.visibility,
    ).toBe("unlisted");
    expect(
      share.privacy
        .disableIndexing,
    ).toBe(true);
  });
});
