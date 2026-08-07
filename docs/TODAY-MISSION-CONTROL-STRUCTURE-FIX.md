# Today Mission Control Structural Repair

The Mission Control dashboard was inserted inside the reusable `AnalystFact`
component rather than inside `TodayPage`.

`AnalystFact` is rendered multiple times for environment, rotation state, and
priority. Consequently, each fact rendered a complete copy of Mission Control,
causing the three overlapping dashboards shown in the browser.

This repair:

- removes Mission Control from `AnalystFact`
- restores `AnalystFact` to a small fact-row component
- places Mission Control once near the end of `TodayPage`
- adds a source-structure regression test
