# Step 2 - Lightning Mine Core Object

Status: completed

## Purpose

Implement the hazard entity that owns timing, visual zaps, and pulse emission.

## Target Files

- `src/LightningMine.ts` (new)

## Work Items

- Create class extending `Body` and implementing `IDrawable`.
- Add lifecycle state for pulse rhythm:
  - `idle`
  - `charging`
  - `pulse`
- Track internal timers for interval and charge windows.
- During draw/update:
  - render ambient zaps continuously
  - render stronger proximity zaps toward nearby ships
  - render pulse emphasis while pulsing
- Query nearest/in-range ships from physics for visual targeting.
- Keep behavior deterministic where practical (seeded jitter if needed).

## Acceptance Criteria

- Mine visibly crackles at all times.
- Proximity visuals react when ships approach.
- Pulse state is distinct and reusable by gameplay effect logic.

## Implementation Notes

- Implemented new module:
  - `src/LightningMine/index.ts`
  - `src/LightningMine/options.ts`
  - `src/LightningMine/constants.ts`
- Added pulse lifecycle state enum (`Idle`, `Charging`, `Pulse`) and timer-driven transitions.
- Added `onPulse()` callback registration to allow later gameplay-effect wiring.
- Added ambient arc rendering and proximity arc rendering against nearby ships.
- Added deterministic option resolver that clamps invalid values to safe defaults.
- Added focused tests in `src/LightningMine.test.ts` for:
  - state transition behavior
  - pulse callback cadence
  - proximity target acquisition
  - option clamping safety
