# Today Dashboard Deduplication Repair

The Intelligence Dashboard 2.0 block had been inserted more than once into the
Today page source. Because each copy occupied the same grid region, the title,
score cards, context panel, event feed, and memory panel stacked directly on top
of one another.

This repair:

- keeps exactly one `mission-control-grid` section
- removes later duplicate copies
- prevents accidental absolute positioning on the dashboard root
- adds a regression test that requires exactly one mission-control section
