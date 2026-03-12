# Step 5 - Level Data and Factories

Status: completed

## Purpose

Make lightning mines spawnable from YAML level data.

## Target Files

- `src/Level/objectFactories.ts`
- `src/Level/DataLevel.ts`
- `src/Level/index.ts`

## Work Items

- Add `createLightningMineFromObject(o: GameObject): LightningMine` factory.
- Validate required props (`range`) and optional override props.
- Register object types in data level factory map:
  - `lightning-mine`
  - `lightningMine`
- Add `addLightningMine()` helper in base level class for physics/graphics wiring.

## Acceptance Criteria

- A YAML object with `type: lightning-mine` spawns correctly.
- Invalid props fail with clear error messages.

## Implementation Notes

- Added `createLightningMineFromObject(o)` in `src/Level/objectFactories.ts`.
  - Requires `props.range` and validates it as `> 0`.
  - Supports optional numeric overrides (timings, gameplay, visual tunables).
  - Supports optional color overrides (`idleColor`, `chargingColor`, `pulseColor`).
  - Applies shared body kinematics validation for velocity/angularVelocity.
- Registered object type factories in `src/Level/DataLevel.ts`:
  - `lightning-mine`
  - `lightningMine`
- Added `addLightningMine()` helper in `src/Level/index.ts`.
- Extended tests in `src/Level/objectFactories.test.ts` for lightning mine factory validation.
