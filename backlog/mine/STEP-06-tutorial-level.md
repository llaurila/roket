# Step 6 - Tutorial Level Authoring

Status: completed

## Purpose

Introduce the mine mechanic in a readable, forgiving mission.

## Target Files

- `src/Levels/LightningMineIntro/index.ts` (new)
- `src/Levels/LightningMineIntro/level.yaml` (new)

## Work Items

- Create new level class (likely minimal subclass of `DataLevel` or `CollectFuel`).
- Author YAML with:
  - shield enabled
  - one lightning mine
  - fuel positions that encourage retreat/re-entry rhythm
  - objective focused on collecting fuel (no explicit recharge objective)
- Tune first-pass values for tutorial feel.

## Acceptance Criteria

- Player can reliably complete on early attempts.
- Attempting immediate back-to-back mine dives is risky enough to teach retreat.
- Objective text remains simple and does not mention recharge as a formal task.

## Implementation Notes

- Added new tutorial level files:
  - `src/Levels/LightningMineIntro/index.ts`
  - `src/Levels/LightningMineIntro/level.yaml`
- Level setup:
  - shield starts enabled
  - one `lightning-mine` object
  - two static fuel capsules near the mine
  - objective remains simple fuel collection (`allCollected`)
- Added level viability test:
  - `src/Levels/LightningMineIntro.test.ts` verifies one mine, two capsules, and shield enabled.
- Lightning mine now applies pulse gameplay effects directly (velocity damp always, shield drain when shielded).
