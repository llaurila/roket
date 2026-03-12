# Step 1 - Mechanic Spec and Constraints

Status: completed

## Purpose

Lock behavior and non-negotiable constraints before writing code.

## Inputs Already Decided

- Mechanic shape: periodic lightning mine (zone-control hazard)
- Targeting: affects all ships (player and NPC)
- Unshielded behavior: velocity damp only, no hull damage
- Level intent: tutorial pacing, readable and forgiving
- Recharge: implicit survival behavior, not an objective

## Deliverables

- Short spec block in code comments or planning notes that defines:
  - pulse cycle states (`idle`, `charging`, `pulse`)
  - effect application moment (on pulse)
  - effect types (shield drain + velocity damp)
  - visual language (ambient arcs + proximity arcs + pulse emphasis)
  - default tuning values and per-instance override policy

## Mechanic Spec

- The mine runs a periodic cycle: `idle -> charging -> pulse`.
- Gameplay effects are applied only on pulse events.
- Pulse applies to all ships in radius:
  - shielded ships: shield drain + velocity damp
  - unshielded ships: velocity damp only
- No direct unshielded hull damage is allowed.
- Visual behavior:
  - ambient crackle/zaps are always visible
  - proximity arcs intensify and extend toward nearby ships
  - pulse moment has stronger visual emphasis

## Security Constraints

- Any numeric level-data inputs used by hazards must be finite numbers.
- Position/velocity vectors from level data must be valid `[x, y]` pairs.
- Invalid values must fail fast with explicit error messages.

## Security Test Scope (Implemented in this step)

- Add tests for level object factories to reject malformed numeric inputs.
- Add tests for rejecting invalid position/velocity vectors.
- Preserve current behavior for valid finite values.

## Acceptance Criteria

- Any developer can implement without re-interpreting gameplay intent.
- The spec explicitly states no direct unshielded hull damage.
- Security validation tests exist for object-factory input hardening.
