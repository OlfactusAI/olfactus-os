# OLFACTUS v1.6.0c — Empty Offer Fix

The Deal Lab previously threw a runtime error when a user temporarily cleared a
price input. The page filters zero-price inputs before analysis, which could
leave the engine with no offers.

The engine now:
- ignores invalid, blank, zero, and negative prices
- falls back to the calibrated typical market price
- continues rendering while the user edits an offer
- includes regression tests for both empty and zero-price offer arrays
