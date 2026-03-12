# Step 4 - Config and Type Wiring

Status: completed

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

## Implementation Notes

- Added `lightningMine` section to `IConfig` in `src/config/types.ts` with:
  - gameplay values (`shieldDrainPerPulse`, `velocityMultiplierPerPulse`, `shieldRechargeLockSeconds`)
  - timing and range values (`range`, `pulseInterval`, `chargeDuration`, `pulseFlashDuration`)
  - visual settings (line width, opacities, arc counts/spread/jitter/overshoot, colors)
- Added default values in `src/config/index.ts` under `Config.lightningMine`.
- Updated `src/LightningMine/options.ts` to source defaults from `Config.lightningMine` and preserve safe clamping/validation.
