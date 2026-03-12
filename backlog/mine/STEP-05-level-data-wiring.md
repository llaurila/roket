# Step 5 - Level Data and Factories

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
