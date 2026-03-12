# Step 8 - Tests and Validation

## Purpose

Verify mechanic correctness, regression safety, and level viability.

## Target Files

- `src/LightningMine.test.ts` (new)
- `src/Ship/index.test.ts` (update)
- `LEVELS.md` (update docs)

## Work Items

- Add unit tests for lightning mine:
  - pulse cadence
  - range gating
  - all-ship effect application
  - unshielded ships receive damp only
- Add ship API tests for:
  - velocity damp
  - direct shield drain and lock behavior
- Update `LEVELS.md` with `lightning-mine` object schema and examples.
- Run validation commands:
  - `pnpm lint`
  - `pnpm test`

## Acceptance Criteria

- Tests are deterministic and pass locally.
- Lint passes with no new warnings/errors.
- Documentation matches implemented schema.
