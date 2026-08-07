# OLFACTUS v1.8.0a — Test and Type-check Fix

Fixes:
- Removes the obsolete requirement that the application manifest channel must
  remain `stable` inside the Knowledge Graph subsystem test.
- Preserves the real Knowledge Graph requirement that the engine remains
  registered.
- Explicitly narrows the latest Evolution snapshot before reading
  `latest.totalWears`, resolving TypeScript error TS18048.
