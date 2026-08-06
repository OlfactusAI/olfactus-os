import { describe, expect, it } from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeDeal } from "@/lib/intelligence/deal-analyzer-engine";

describe("Deal Analyzer empty-offer handling", () => {
  it("uses the typical market price when no valid offer is present", () => {
    const result = analyzeDeal({
      candidateId: fragrances[0].id,
      offers: [],
      collection: demoCollection,
      catalog: fragrances,
    });

    expect(result.bestOffer.price).toBeGreaterThan(0);
    expect(result.bestOffer.seller).toBe(
      "Typical Market Price",
    );
    expect(result.purchaseScore).toBeGreaterThanOrEqual(0);
  });

  it("ignores temporarily blank or zero-price offers", () => {
    const result = analyzeDeal({
      candidateId: fragrances[0].id,
      offers: [
        {
          id: "blank",
          seller: "Current Offer",
          price: 0,
          condition: "new",
        },
      ],
      collection: demoCollection,
      catalog: fragrances,
    });

    expect(result.offers).toHaveLength(1);
    expect(result.bestOffer.price).toBeGreaterThan(0);
  });
});
