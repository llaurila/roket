# Step 2 - Lightning Mine Core Object

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
