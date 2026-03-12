# Step 3 - Ship Effect APIs

## Purpose

Expose explicit, deterministic ship methods for mine-driven effects.

## Target Files

- `src/Ship/index.ts`
- `src/Ship/index.test.ts`

## Work Items

- Add `applyVelocityDamp(multiplier: number): void`.
  - Clamp multiplier to safe bounds.
  - Apply directly to current velocity vector.
- Add `drainShield(amount: number, rechargeLock?: number): void`.
  - No-op if ship not alive or shield disabled.
  - Clamp drain amount and resulting integrity.
  - Optionally apply recharge lock.
  - Trigger death if integrity reaches zero.
- Keep existing collision shield flow unchanged.

## Acceptance Criteria

- Mine logic can call dedicated APIs rather than reusing collision methods.
- Existing shield collision tests still pass.
- New tests validate damp and direct shield drain behavior.
