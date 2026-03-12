# Step 4 - Config and Type Wiring

## Purpose

Add globally tunable defaults with strict typing.

## Target Files

- `src/config/types.ts`
- `src/config/index.ts`

## Work Items

- Add `lightningMine` section to `IConfig` with fields for:
  - gameplay values (range, pulse interval, charge duration, shield drain, damp multiplier, lock duration)
  - visuals (colors, line width, arc counts, arc jitter, overshoot, proximity range, opacity)
- Add corresponding default values in config index.
- Keep values documented and named by gameplay meaning.

## Acceptance Criteria

- New config compiles under strict typings.
- Lightning mine class can run entirely from config defaults unless object overrides are provided.
