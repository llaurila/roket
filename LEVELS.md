# Level Authoring

For NPC controller behavior and level-specific AI tuning, see [AI.md](AI.md).

This project uses a hybrid level system:

- `level.yaml` holds static data such as metadata, variables, ship fuel, objects, and objective wiring.
- `index.ts` holds the level class, custom objective checks, and any dynamic object generation.

The base implementation lives in [src/Level/DataLevel.ts](src/Level/DataLevel.ts). A level becomes playable only after it is added to [src/Scenes/Gameplay/index.ts](src/Scenes/Gameplay/index.ts).

## File Layout

Create a new folder under `src/Levels`:

```text
src/Levels/MyNewLevel/
  index.ts
  level.yaml
```

Typical examples:

- [src/Levels/Introduction](src/Levels/Introduction)
- [src/Levels/CollectFuel](src/Levels/CollectFuel)
- [src/Levels/HotLap](src/Levels/HotLap)

## How Levels Work

Every level class extends `DataLevel`.

`DataLevel` already handles:

- reading `name`, `description`, `soundtrack`, and `variables`
- applying the starting ship fuel amount
- creating static objects declared in YAML
- building objective dependencies from YAML
- evaluating mission completion

You still need to provide custom logic for anything beyond a static `kill` objective by implementing `registerObjectiveChecks()` in the level class.

Global mission failure is handled by [src/Level/mission.ts](src/Level/mission.ts):

- the player ship is destroyed
- the player runs out of fuel
- an objective-specific failure check returns a message

## Step 1: Create The YAML

`level.yaml` must match the `LevelData` shape defined in [src/Level/types.ts](src/Level/types.ts).

Supported top-level fields:

- `name: string`
- `description: string`
- `soundtrack?: string`
- `randomSeed?: number`
- `variables: Record<string, unknown>`
- `cosmos?: boolean`
- `ship.fuelTank.currentAmount: number`
- `ship.weapons?: ShipWeaponType[]` (`laser` supported today)
- `objects: GameObject[]`
- `objectives: LevelObjective[]`

Example:

```yaml
name: "LEVEL X: EXAMPLE"
description: >
  REACH THE BEACON AND COLLECT THE FUEL CAPSULE.

soundtrack: ambient

variables:
  TIME_LIMIT: 45

ship:
  fuelTank:
    currentAmount: 120
  weapons: [laser]

objects:
  - id: home
    type: beacon
    position: [0, 0]
  - id: prize
    type: fuel
    position: [100, 80]
    angularVelocity: 0.3
    props:
      amount: 100

objectives:
  - id: collect-prize
    title: COLLECT THE FUEL CAPSULE
    successChecks:
      - type: kill
        target: prize
  - id: return-home
    title: RETURN TO THE BEACON
    externalSuccessCheck: beaconReached
    dependsOn: collect-prize
```

## Step 2: Create The Level Class

Start from the simplest possible class:

```ts
import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";

class MyNewLevel extends DataLevel {
    public constructor() {
        super(data as LevelData);
    }

    protected registerObjectiveChecks(): void {
    }
}

export default MyNewLevel;
```

If the YAML only uses built-in `successChecks`, this can be enough.

## Step 3: Add Custom Objective Checks

Most non-trivial levels register named checks in `registerObjectiveChecks()` and then reference those names from YAML.

Patterns already used in the codebase:

- speed threshold checks in [src/Levels/VelocityControl/index.ts](src/Levels/VelocityControl/index.ts)
- beacon detection checks in [src/Levels/HotLap/index.ts](src/Levels/HotLap/index.ts)
- object state checks in [src/Levels/DeepSpaceMission/index.ts](src/Levels/DeepSpaceMission/index.ts)
- score or race outcome checks in [src/Levels/FuelRush/index.ts](src/Levels/FuelRush/index.ts)

Example:

```ts
import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";
import type { Beacon } from "@/Beacon";

class MyNewLevel extends DataLevel {
    public constructor() {
        super(data as LevelData);
    }

    protected registerObjectiveChecks(): void {
        this.registerObjectiveTest("beaconReached", () => {
            const beacon = this.getObject<Beacon>("home");
            return beacon.canDetectShip(this.ship);
        });
    }
}

export default MyNewLevel;
```

Then reference it in YAML:

```yaml
objectives:
  - id: return-home
    title: RETURN TO THE BEACON
    externalSuccessCheck: beaconReached
```

## Available Objective Mechanisms

### Built-in `successChecks`

The built-in YAML success checks are currently limited.

Supported today:

- `kill`: succeeds when the target object no longer exists or is no longer alive

Example:

```yaml
successChecks:
  - type: kill
    target: fuel-1
```

If you need anything else, add a named external check in the level class.

### `externalSuccessCheck`

This runs a named function registered in `registerObjectiveChecks()`.

It supports either a plain string:

```yaml
externalSuccessCheck: beaconReached
```

Or a function name with arguments:

```yaml
externalSuccessCheck:
  test: beaconReached
  args: [beacon-1, beacon-2]
```

That argument form is used by [src/Levels/HotLap/level.yaml](src/Levels/HotLap/level.yaml).

### `externalFailureCheck`

Use this when an objective can actively fail and should end the mission with a custom message.

```yaml
externalFailureCheck:
  test: timeExceeded
  message: TOO SLOW.
```

The failure function must return `true` when the objective has failed.

### `dependsOn`

Use `dependsOn` to enforce ordering.

```yaml
dependsOn: first-objective
```

Or:

```yaml
dependsOn: [first-objective, second-objective]
```

An objective only succeeds after all of its dependencies are already complete.

## Supported Static Objects

`DataLevel` currently creates these object types from YAML:

- `fuel`
- `beacon`
- `gravity-well`
- `meteor`

Defined in [src/Level/DataLevel.ts](src/Level/DataLevel.ts).

### Fuel Object

Supported fields:

- `id`
- `type: fuel`
- `position: [x, y]`
- `angularVelocity?`
- `props.amount?`

### Beacon Object

Supported fields:

- `id`
- `type: beacon`
- `position: [x, y]`
- `props.active?`

Beacon behavior is defined in [src/Beacon.ts](src/Beacon.ts). Detection uses the configured beacon radius from [src/config/index.ts](src/config/index.ts).

### Gravity Well Object

Supported fields:

- `id`
- `type: gravity-well`
- `position: [x, y]`
- `props.range`
- `props.strength`

Gravity well behavior is defined in [src/GravityWell.ts](src/GravityWell.ts). `range` controls how far the pull reaches and `strength` controls the pull magnitude at the center, with linear falloff to zero at the edge of the range.

### Meteor Object

Supported fields:

- `id`
- `type: meteor`
- `position: [x, y]`
- `velocity?: [vx, vy]`
- `angularVelocity?`
- `props.diameter`
- `props.mass`
- `props.cornerCount?`

Meteor behavior is defined in [src/Meteor.ts](src/Meteor.ts). Meteors render as deterministic, roundish polygon outlines seeded from the level `randomSeed` plus object `id`. They collide with ships and other meteors using a circle collider based on `props.diameter`.

## Variables And Dynamic Text

Descriptions and objective titles support `${...}` substitutions through `formatString()`.

There are two sources of runtime variables:

- static values from `variables` in YAML
- dynamic values returned by `getRuntimeVars()` in the level class

Example from existing levels:

- [src/Levels/CollectFuel/index.ts](src/Levels/CollectFuel/index.ts) exposes `${collected}` and `${total}`
- [src/Levels/HotLap/index.ts](src/Levels/HotLap/index.ts) exposes `${timeLimit}`

Pattern:

```ts
protected override getRuntimeVars(): Record<string, string> {
    return {
        ...super.getRuntimeVars(),
        score: this.getScore().toString()
    };
}
```

## Dynamic Objects

If the level needs procedural content, override `createObjects()` and call `super.createObjects()` first.

This is used for:

- random fuel generation in [src/Levels/CollectFuel/index.ts](src/Levels/CollectFuel/index.ts)
- NPC setup in [src/Levels/GameOfTag/index.ts](src/Levels/GameOfTag/index.ts)
- mixed static and dynamic race logic in [src/Levels/FuelRush/index.ts](src/Levels/FuelRush/index.ts)

Pattern:

```ts
public createObjects(): void {
    super.createObjects();
    this.generateSomething();
}
```

Use `this.rng` when you want deterministic procedural placement tied to `randomSeed`.

## Register The Level

After creating the level files, add the new class import and insert it into `levelTypes` in [src/Scenes/Gameplay/index.ts](src/Scenes/Gameplay/index.ts).

Until you do that, the level cannot be loaded by the game flow.

## Recommended Workflow

1. Start with a YAML-only level if possible.
2. Add a small `index.ts` subclass with one custom check if needed.
3. Only add dynamic object creation after the objective logic is clear.
4. Add the level to [src/Scenes/Gameplay/index.ts](src/Scenes/Gameplay/index.ts).
5. Run the game and tune positions, fuel amounts, and thresholds.

## Constraints To Keep In Mind

- This system is not fully data-driven. Most interesting mechanics require TypeScript code.
- `DataLevel` only knows how to create `fuel` and `beacon` objects out of YAML.
- YAML `successChecks` only support `kill` right now.
- Mission failure for ship destruction and empty fuel is automatic.
- Objective ordering is dependency-based, not implicit by list order.

## Minimal Checklist For A New Level

- add `src/Levels/MyNewLevel/level.yaml`
- add `src/Levels/MyNewLevel/index.ts`
- implement `registerObjectiveChecks()` if the YAML uses external checks
- optionally override `createObjects()` for dynamic content
- optionally override `getRuntimeVars()` for dynamic text
- register the level in [src/Scenes/Gameplay/index.ts](src/Scenes/Gameplay/index.ts)
- run the game and verify the objectives can be completed and failed as intended

