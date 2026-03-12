# Step 3 - Ship Effect APIs

Status: completed

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

## Implementation Notes

- Implemented `applyVelocityDamp(multiplier: number): void` in `src/Ship/index.ts`.
  - Applies only when the ship is alive.
  - Clamps multiplier to `[0, 1]`.
- Implemented `drainShield(amount: number, rechargeLock?: number): void` in `src/Ship/index.ts`.
  - No-op when ship is not alive or shield is disabled.
  - Clamps drain amount to non-negative values.
  - Applies optional recharge lock using max(current, incoming).
  - Triggers death when shield integrity reaches zero.
- Refactored `absorbShieldImpact()` to reuse `drainShield()`.
- Added tests to `src/Ship/index.test.ts` for:
  - velocity damp clamping and scaling
  - shield drain depletion and destruction
  - shield drain no-op when shield is disabled
