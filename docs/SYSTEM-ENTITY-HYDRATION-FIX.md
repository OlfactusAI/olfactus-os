# OLFACTUS v2.3.0-alpha.2 System Entity Hydration Repair

The Entity Registry diagnostics measured build duration with
`performance.now()` during component render. Server and browser timings
naturally differed, so the generated text could never hydrate
consistently.

This repair:

- removes timing from `collectEntityDiagnostics()`
- adds a dedicated `measureEntityRegistryBuildTime()` function
- runs that measurement only after client hydration
- renders a stable em dash on both server and initial client render
- gates every registry diagnostic until hydration, protecting imported
  local-catalog values as well
