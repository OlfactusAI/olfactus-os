# OLFACTUS v1.6.0c — Deal Score Alignment Fix

The Buy Window scale and headline Purchase Score previously used partially
independent classifications. A deeply discounted offer could therefore appear
in the Exceptional region while the headline remained Fair Price or Good Buy.

The final hierarchy is now:

- price at or below the bottom of the buy window:
  - Exceptional Deal
  - minimum Purchase Score 90
- price inside the buy window:
  - Good Buy
  - minimum Purchase Score 80
- price up to the wait threshold:
  - Fair Price
  - minimum Purchase Score 68
- moderately above the threshold:
  - Wait for Sale
- materially above the threshold:
  - Overpriced

Extreme collection overlap or blind-buy risk may still produce an explicit
high-risk override rather than an unconditional purchase recommendation.
