# System Diagnostics Hydration Fix

The `/system` page previously called `collectSystemDiagnostics()` inside the
initial `useState` initializer.

During server rendering, browser-local values were unavailable and rendered as
zero. During client hydration, localStorage values were immediately available,
so React saw different text and regenerated the page.

This repair:

- uses a deterministic server-safe initial diagnostics snapshot
- renders placeholders until hydration completes
- loads browser-local diagnostics inside `useEffect`
- refreshes diagnostics after recovery, timeline, and active-catalog events
- avoids reading the recovery ledger during server rendering
