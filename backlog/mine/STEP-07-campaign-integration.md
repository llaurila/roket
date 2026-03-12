# Step 7 - Campaign Integration and Renumbering

Status: completed

## Purpose

Insert the new mine tutorial in progression and keep level labels consistent.

## Target Files

- `src/Scenes/Gameplay/index.ts`
- `src/Levels/MeteorField/level.yaml`
- `src/Levels/BlockadeRun/level.yaml`

## Work Items

- Import and insert `LightningMineIntro` before `MeteorField` in `levelTypes`.
- Update level title strings:
  - Meteor Field from 9 to 10
  - Blockade Run from 10 to 11
- Verify no other hardcoded assumptions require changes.

## Acceptance Criteria

- Campaign order is valid and navigable.
- New level appears as Level 9.
- Existing later levels keep intended order after renumbering.

## Implementation Notes

- Added `LightningMineIntro` to campaign ordering in `src/Scenes/Gameplay/index.ts`.
- Inserted `LightningMineIntro` before `MeteorField` in `levelTypes`.
- Updated level title strings:
  - `src/Levels/MeteorField/level.yaml`: `LEVEL 10`
  - `src/Levels/BlockadeRun/level.yaml`: `LEVEL 11`
