# OLFACTUS v2.1.0-alpha.3

Adds a universal recovery ledger, transaction-level simulator rollback,
local backup and restore, `/system` diagnostics, runtime error recovery,
and workflow-validation tests.

The simulator now applies an entire scenario as one collection transaction.
Undo restores the full pre-scenario collection snapshot; redo reapplies the
post-scenario snapshot.

The backup file includes collection state, imported records, scenarios,
timeline data, search history, assistant feedback, graph session, and the
recovery ledger.
