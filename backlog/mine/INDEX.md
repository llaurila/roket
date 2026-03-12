# Lightning Mine Backlog

This folder defines the implementation process for introducing the periodic lightning mine mechanic and its tutorial level.

## Goal

Implement a configurable lightning mine hazard that:

- constantly zaps visually
- pulses on a timer
- affects all ships in range (player and NPC)
- drains shield for shielded ships
- applies velocity damp to all ships
- does not directly damage unshielded hull

Add a new tutorial-like campaign level that teaches the loop:

1. collect fuel near a mine
2. retreat to recover shield
3. return for the next fuel

Recharge is not a mission objective; it is an implicit survival requirement.

## Final Plan

- Add `src/LightningMine.ts` as a new hazard (`Body` + `IDrawable`) with pulse timing state (`idle`, `charging`, `pulse`), always-on ambient arcs, and proximity-targeted arcs with slight overshoot.
- Extend `src/Ship/index.ts` with deterministic mine-effect APIs:
  - `applyVelocityDamp(multiplier: number): void`
  - `drainShield(amount: number, rechargeLock?: number): void`
- Add configurable defaults in `src/config/index.ts` and matching typings in `src/config/types.ts` under `lightningMine`.
- Add level-data support for `lightning-mine` objects:
  - `src/Level/objectFactories.ts` factory
  - `src/Level/DataLevel.ts` object type registration
  - `src/Level/index.ts` helper to add the object to physics and graphics
- Create a new tutorial level:
  - `src/Levels/LightningMineIntro/index.ts`
  - `src/Levels/LightningMineIntro/level.yaml`
  - Shield enabled, mine + fuel layout tuned for learnable retreat/re-entry rhythm.
- Insert the new level as campaign Level 9 in `src/Scenes/Gameplay/index.ts`.
- Renumber level titles:
  - `src/Levels/MeteorField/level.yaml` to Level 10
  - `src/Levels/BlockadeRun/level.yaml` to Level 11
- Add tests:
  - new `src/LightningMine.test.ts`
  - extend `src/Ship/index.test.ts`
  - verify pulse cadence, range gating, all-ship targeting, and unshielded behavior
- Update `LEVELS.md` with `lightning-mine` authoring docs and props.
- Run `pnpm lint` and `pnpm test`.

## Tutorial Baseline Tuning

Initial values to start from (subject to in-game tuning):

- pulse interval: `1.35s`
- charge duration: `0.40s`
- range: `26`
- shield drain per pulse: `0.18`
- velocity multiplier per pulse: `0.65`
- proximity zap range: `32`
- arc overshoot: `4`
- shield lock on pulse: `~0.3s`

## Implementation Steps

- [Step 1 - Mechanic Spec and Constraints](./STEP-01-mechanic-spec.md)
- [Step 2 - Lightning Mine Core Object](./STEP-02-lightning-mine-object.md)
- [Step 3 - Ship Effect APIs](./STEP-03-ship-effect-apis.md)
- [Step 4 - Config and Type Wiring](./STEP-04-config-and-types.md)
- [Step 5 - Level Data and Factories](./STEP-05-level-data-wiring.md)
- [Step 6 - Tutorial Level Authoring](./STEP-06-tutorial-level.md)
- [Step 7 - Campaign Integration and Renumbering](./STEP-07-campaign-integration.md)
- [Step 8 - Tests and Validation](./STEP-08-tests-and-validation.md)
